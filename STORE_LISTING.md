# Chrome Web Store Listing — Pozzolanic Browser

Paste these fields into the dev console when uploading `pozzolanic-browser-0.1.0.zip`.

---

## Visibility
**Unlisted**

## Distribution
- Regions: all (default)
- Pricing: free

## Category
Productivity

## Language
English (United States)

## Name (45 char max)
Pozzolanic Browser

## Summary (132 char max)
Hide sponsored results, shorts, and promoted posts on Amazon, YouTube, and LinkedIn. Bundled rules, no tracking, no remote code.

## Description
Pozzolanic Browser hides distracting elements on a small set of sites you visit every day.

**What it does**
- Amazon: hides sponsored search results and ad placements
- YouTube: hides the Shorts shelf and sidebar Shorts link
- LinkedIn: hides promoted posts and ad banners

**How it works**
The extension ships with a small list of CSS selectors. When you visit one of the supported sites, a single `<style>` tag is added that hides the matching elements. That's the entire mechanism.

**What it does NOT do**
- Does not read or send your page content anywhere
- Does not fetch rules from a server
- Does not execute remote code
- Does not request access to your tabs, history, cookies, or browsing data
- Does not run on any site outside the three listed

**Permissions explained**
- `storage`: remembers your per-site on/off toggle preferences
- Host access: only the three supported sites — Amazon, YouTube, LinkedIn

**Per-site toggle**
Click the extension icon to enable or disable the rules per site. Your preferences are stored locally.

## Privacy practices

### Single purpose
Hide a curated set of distracting elements (sponsored results, shorts, promoted posts) on Amazon, YouTube, and LinkedIn using bundled CSS selectors.

### Permission justifications
- **storage**: persist per-host enable/disable toggles between sessions. Stored locally via `chrome.storage.local`.
- **Host permission — `*.amazon.com`**: inject CSS to hide sponsored search results and ad widgets.
- **Host permission — `*.youtube.com`**: inject CSS to hide the Shorts shelf and Shorts navigation link.
- **Host permission — `*.linkedin.com`**: inject CSS to hide promoted posts and ad banners.

### Data usage disclosure
- Does NOT collect or transmit personally identifiable information.
- Does NOT collect or transmit health, financial, authentication, personal communications, location, web history, or user activity data.
- Does NOT collect website content beyond what is required to apply CSS selectors locally (and never transmits any content off-device).
- Stores only the user's per-host on/off toggle preferences via `chrome.storage.local`.

### Certifications (toggle all three)
- [x] I do not sell or transfer user data to third parties, outside of the approved use cases.
- [x] I do not use or transfer user data for purposes unrelated to my item's single purpose.
- [x] I do not use or transfer user data to determine creditworthiness or for lending purposes.

### Privacy policy URL
*Not required when no data is collected.* If the dev console insists on one, use:
`https://github.com/shswanson/pozzolanic-browser/blob/main/PRIVACY.md`
(and we'll add a `PRIVACY.md` to the repo before submitting.)

## Support
- Support email: scott@totib.com
- Website: https://github.com/shswanson/pozzolanic-browser (after first push)

## Screenshots (1280×800 or 640×400)
- Not strictly required for unlisted listings, but the console may prompt you. We can skip during initial submission and add later if needed.

## Promotional images
- Skip. Not required for unlisted.
