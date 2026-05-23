# Release Flow

This repo auto-publishes to the Chrome Web Store via GitHub Actions on tag push.

## Routine: shipping a new version

After the one-time setup (below) is done, every release is:

```sh
# 1. Edit rules.js (or whatever changed). Commit normally.
git add rules.js
git commit -m "Add LinkedIn 'people you may know' rule"
git push

# 2. Tag the new version. Use semver. Tag must start with "v".
git tag v0.2.0
git push --tags
```

That's it. The `Release to Chrome Web Store` workflow will:

1. Rewrite `manifest.json` to set `"version": "0.2.0"` (matching the tag).
2. Zip the extension files.
3. Get a fresh OAuth access token using the stored refresh token.
4. Upload the zip to the existing store item.
5. Trigger `publish` against the `default` target.

Chrome Sync picks up the new version on your machines within a few hours.

---

## One-time setup

You only do this once. Steps 1–3 are in Google Cloud Console. Step 4 is local. Step 5 is in GitHub.

### 1. Enable the Chrome Web Store API

Go to https://console.cloud.google.com/apis/library/chromewebstore.googleapis.com — make sure you're in a Google Cloud project owned by the **same Google identity** that owns the Chrome Web Store publisher account. Click **Enable**.

If you don't have a project yet, create one called `pozzolanic-browser` first.

### 2. Create OAuth 2.0 Client ID

Go to https://console.cloud.google.com/apis/credentials in the same project.

- Click **+ Create Credentials → OAuth client ID**.
- If prompted to configure the consent screen first: Internal user type, app name "Pozzolanic Browser Release", your email as contact. Scopes can stay empty (we'll request the scope at runtime). Save.
- Back at the credentials page: **Application type: Desktop app**, name "Pozzolanic Release CLI".
- Copy the **Client ID** and **Client Secret** — you'll need them in the next step.

### 3. Generate a refresh token

On your Mac, in this repo:

```sh
python3 scripts/get-refresh-token.py <client_id> <client_secret>
```

A browser tab will open. Sign in with the **same Google identity** that owns the Chrome Web Store publisher account. Approve the consent prompt. The terminal will print the refresh token.

Copy it.

### 4. Find the extension's Item ID

After your first manual submission, the Chrome Web Store dev console URL for your extension looks like:

```
https://chrome.google.com/webstore/devconsole/<dev-account-id>/<item-id>/edit
```

The `<item-id>` is a 32-char hex string. That's your `CWS_EXTENSION_ID`.

### 5. Add four GitHub repo secrets

Go to https://github.com/shswanson/pozzolanic-browser/settings/secrets/actions and add:

| Secret name | Value |
|---|---|
| `CWS_CLIENT_ID` | from step 2 |
| `CWS_CLIENT_SECRET` | from step 2 |
| `CWS_REFRESH_TOKEN` | from step 3 |
| `CWS_EXTENSION_ID` | from step 4 |

Done. The next `git push --tags` will publish.

---

## Troubleshooting

- **`Upload failed: FAILURE`** — usually a manifest validation error. Check the run logs: the upload response includes `itemError` with detail.
- **`Publish failed: ITEM_NOT_UPDATABLE`** — the item is still under review from a prior submission. Wait for review to clear, then re-tag.
- **`invalid_grant`** on token exchange — the refresh token was revoked (happens if the OAuth client was deleted, or if you didn't sign in with the right Google identity). Re-run `scripts/get-refresh-token.py` and update the secret.
- **Tag doesn't trigger the workflow** — make sure you pushed the tag (`git push --tags`), not just the commit. Workflow only fires on `refs/tags/v*`.
