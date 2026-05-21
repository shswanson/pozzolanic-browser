// Pozzolanic Browser content script.
// Reads bundled POZZOLANIC_RULES (loaded first by manifest), injects a
// single <style> tag with display:none rules for matching selectors.
// No DOM mutation beyond the style element. No network. No eval.

(function () {
  const HOST = location.hostname;
  const STORAGE_KEY = 'pozzolanic.disabled_hosts';
  const STYLE_MARKER = 'data-pozzolanic-style';

  function applicableRules() {
    if (typeof POZZOLANIC_RULES === 'undefined') return [];
    return POZZOLANIC_RULES.filter((r) => HOST.includes(r.host));
  }

  function buildCss(rules) {
    return rules
      .map((r) => `/* ${r.label.replace(/\*\//g, '*\\/')} */\n${r.selector} { display: none !important; }`)
      .join('\n\n');
  }

  function inject(rules) {
    if (!rules.length) return;
    if (document.querySelector(`style[${STYLE_MARKER}]`)) return;
    const style = document.createElement('style');
    style.setAttribute(STYLE_MARKER, '1');
    style.textContent = buildCss(rules);
    (document.head || document.documentElement).appendChild(style);
  }

  function remove() {
    document.querySelectorAll(`style[${STYLE_MARKER}]`).forEach((n) => n.remove());
  }

  function apply() {
    chrome.storage.local.get([STORAGE_KEY], (data) => {
      const disabled = data[STORAGE_KEY] || [];
      const hostDisabled = disabled.some((h) => HOST.includes(h));
      if (hostDisabled) {
        remove();
        return;
      }
      inject(applicableRules());
    });
  }

  apply();

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes[STORAGE_KEY]) apply();
  });
})();
