// Pozzolanic Browser rules.
// Shape: { host, selector, action: 'hide', label }
// - host: matched as substring of location.hostname
// - selector: standard CSS selector (incl. :has() — Chrome supports it)
// - action: 'hide' is the only supported action in v0.1
// - label: human-readable; shown in popup diagnostics

const POZZOLANIC_RULES = [
  // ---- Amazon ----
  { host: 'amazon.com', selector: '[data-component-type="sp-sponsored-result"]', action: 'hide', label: 'Amazon: sponsored result block' },
  { host: 'amazon.com', selector: '.s-result-item[data-component-type="s-search-result"][data-sponsored="true"]', action: 'hide', label: 'Amazon: sponsored search item' },
  { host: 'amazon.com', selector: '.s-result-item:has(.puis-sponsored-label-text)', action: 'hide', label: 'Amazon: sponsored search item (label variant)' },
  { host: 'amazon.com', selector: 'div.AdHolder', action: 'hide', label: 'Amazon: ad holder' },
  { host: 'amazon.com', selector: '[data-cel-widget^="MAIN-SPONSORED_PRODUCTS"]', action: 'hide', label: 'Amazon: sponsored products widget' },

  // ---- YouTube ----
  { host: 'youtube.com', selector: 'ytd-reel-shelf-renderer', action: 'hide', label: 'YouTube: shorts reel shelf' },
  { host: 'youtube.com', selector: 'ytd-rich-shelf-renderer[is-shorts]', action: 'hide', label: 'YouTube: shorts rich shelf' },
  { host: 'youtube.com', selector: 'ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts])', action: 'hide', label: 'YouTube: shorts section wrapper' },
  { host: 'youtube.com', selector: 'a[title="Shorts"]', action: 'hide', label: 'YouTube: sidebar Shorts link' },

  // ---- LinkedIn ----
  { host: 'linkedin.com', selector: '.feed-shared-update-v2:has([aria-label*="Promoted"])', action: 'hide', label: 'LinkedIn: promoted post' },
  { host: 'linkedin.com', selector: '.ad-banner-container', action: 'hide', label: 'LinkedIn: ad banner' },
  { host: 'linkedin.com', selector: '.feed-shared-update-v2:has(.update-components-promoted-tag)', action: 'hide', label: 'LinkedIn: promoted tag variant' },
];

// Expose for both content script and popup contexts.
if (typeof window !== 'undefined') {
  window.POZZOLANIC_RULES = POZZOLANIC_RULES;
}
