// Pozzolanic Browser content script.
// - CSS rules: inject a single <style> tag with display:none rules.
// - Text rules: walk matching containers and hide ones whose text matches.
// No DOM mutation beyond style + display:none. No network. No eval.

(function () {
  const HOST = location.hostname;
  const STORAGE_KEY = 'pozzolanic.disabled_hosts';
  const STYLE_MARKER = 'data-pozzolanic-style';
  const HIDDEN_MARKER = 'data-pozzolanic-hidden';

  function applicableCssRules() {
    if (typeof POZZOLANIC_RULES === 'undefined') return [];
    return POZZOLANIC_RULES.filter((r) => HOST.includes(r.host));
  }

  function applicableTextRules() {
    if (typeof POZZOLANIC_TEXT_RULES === 'undefined') return [];
    return POZZOLANIC_TEXT_RULES.filter((r) => HOST.includes(r.host));
  }

  function buildCss(rules) {
    return rules
      .map((r) => `/* ${r.label.replace(/\*\//g, '*\\/')} */\n${r.selector} { display: none !important; }`)
      .join('\n\n');
  }

  function injectCss(rules) {
    if (!rules.length) return;
    if (document.querySelector(`style[${STYLE_MARKER}]`)) return;
    const style = document.createElement('style');
    style.setAttribute(STYLE_MARKER, '1');
    style.textContent = buildCss(rules);
    (document.head || document.documentElement).appendChild(style);
  }

  function removeCss() {
    document.querySelectorAll(`style[${STYLE_MARKER}]`).forEach((n) => n.remove());
  }

  // Pure text scan — checks text nodes inside `el` for `text` as a standalone
  // word or as the start of a label (e.g. "Sponsored" or "Sponsored Ad - ...").
  // Reads DOM only; transmits nothing.
  function containsTextLabel(el, text) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    let node;
    while ((node = walker.nextNode())) {
      const t = (node.textContent || '').trim();
      if (!t) continue;
      if (t === text || t.startsWith(text + ' ') || t.startsWith(text + ':')) return true;
    }
    return false;
  }

  function applyTextRules(rules) {
    if (!rules.length) return;
    for (const rule of rules) {
      const containers = document.querySelectorAll(rule.container);
      for (const c of containers) {
        if (c.hasAttribute(HIDDEN_MARKER)) continue;
        if (containsTextLabel(c, rule.text)) {
          c.style.setProperty('display', 'none', 'important');
          c.setAttribute(HIDDEN_MARKER, '1');
        }
      }
    }
  }

  function showAllPreviouslyHidden() {
    document.querySelectorAll(`[${HIDDEN_MARKER}]`).forEach((n) => {
      n.style.removeProperty('display');
      n.removeAttribute(HIDDEN_MARKER);
    });
  }

  let observer = null;
  let textRulesCache = [];

  function startObserver() {
    if (observer || !textRulesCache.length) return;
    let scheduled = false;
    observer = new MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        applyTextRules(textRulesCache);
      });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  function stopObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  function apply() {
    chrome.storage.local.get([STORAGE_KEY], (data) => {
      const disabled = data[STORAGE_KEY] || [];
      const hostDisabled = disabled.some((h) => HOST.includes(h));
      if (hostDisabled) {
        removeCss();
        stopObserver();
        showAllPreviouslyHidden();
        textRulesCache = [];
        return;
      }
      injectCss(applicableCssRules());
      textRulesCache = applicableTextRules();
      applyTextRules(textRulesCache);
      startObserver();
    });
  }

  apply();

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes[STORAGE_KEY]) apply();
  });
})();
