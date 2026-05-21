# Pozzolanic Browser — Privacy Policy

**Last updated:** 2026-05-21

## Summary
This extension does not collect, transmit, or sell any user data. It runs entirely on your device.

## What this extension does
Pozzolanic Browser hides specific page elements on a small set of websites (Amazon, YouTube, LinkedIn) by injecting CSS rules that are bundled inside the extension itself.

## Data collection
**None.**

- The extension does not transmit any data off your device.
- The extension does not contact any server, including its own.
- The extension does not include analytics, telemetry, error reporting, or crash reporting.
- The extension does not read or store page content.

## Local storage
The extension uses `chrome.storage.local` to remember a single piece of state: which of the supported sites you have toggled on or off via the extension's popup. This data never leaves your device.

## Permissions
- `storage`: used solely to persist per-host on/off toggle preferences described above.
- Host access (`*.amazon.com`, `*.youtube.com`, `*.linkedin.com`): used solely to inject CSS that hides elements matching the bundled selectors. No content is read; no data is sent.

## Third parties
The extension has no third-party integrations.

## Changes
If the extension's behavior ever changes in a way that affects this policy, the policy will be updated and the extension's version will be bumped accordingly. Source is public at https://github.com/shswanson/pozzolanic-browser.

## Contact
scott@totib.com
