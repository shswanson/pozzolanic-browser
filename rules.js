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
  // Carousels and sponsored brand units
  { host: 'amazon.com', selector: '[data-component-type="s-shopping-adviser"]', action: 'hide', label: 'Amazon: shopping adviser carousel (sponsored)' },
  { host: 'amazon.com', selector: '[data-component-type^="sb-"]', action: 'hide', label: 'Amazon: sponsored brand units (banner/video)' },
  { host: 'amazon.com', selector: '[data-component-type="sbv-video-single-product"]', action: 'hide', label: 'Amazon: sponsored brand video' },
  { host: 'amazon.com', selector: '[data-cel-widget*="SPONSORED"]', action: 'hide', label: 'Amazon: any sponsored cel-widget' },
  // Catch-all: any top-level search-result section with a Sponsored label nested inside
  { host: 'amazon.com', selector: '.s-widget-spacing-large:has(.puis-sponsored-label-text)', action: 'hide', label: 'Amazon: widget block containing Sponsored label' },
  { host: 'amazon.com', selector: 'div.a-section:has(> div > .puis-sponsored-label-text)', action: 'hide', label: 'Amazon: section block containing Sponsored label' },

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

// Text-based hide rules. CSS can't match by text content, so for sites that
// label sponsored items in text only (Amazon's "Sponsored Ad - ..." titles),
// we walk the DOM and hide containers whose text matches.
//
// Shape: { host, container, text, label }
// - container: CSS selector for the candidate wrapper to test (and hide)
// - text: substring to look for inside that container
// Multiple text matches share one MutationObserver per host.

const POZZOLANIC_TEXT_RULES = [
  {
    host: 'amazon.com',
    container: [
      '[data-component-type="s-search-result"]',
      '.s-result-item[data-asin]:not([data-asin=""])',
      '[data-component-type^="sb-"]',
      '[data-component-type^="sbv-"]',
      '[data-component-type^="s-brand"]',
      '[data-component-type="s-shopping-adviser"]',
      '.s-widget-spacing-large',
      '[data-cel-widget*="MAIN-SBX"]',
      '[data-cel-widget*="MAIN-SB_"]',
      '[data-cel-widget*="MAIN-PROMOTION"]',
    ].join(', '),
    text: 'Sponsored',
    label: 'Amazon: any widget block containing the word "Sponsored"',
  },
];

// Expose for both content script and popup contexts.
if (typeof window !== 'undefined') {
  window.POZZOLANIC_RULES = POZZOLANIC_RULES;
  window.POZZOLANIC_TEXT_RULES = POZZOLANIC_TEXT_RULES;
}
