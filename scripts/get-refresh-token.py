#!/usr/bin/env python3
"""
One-time OAuth helper for Chrome Web Store Publish API.

Run this LOCALLY (on your Mac), signed into your dev-account Google identity
in the default browser. It will:

  1. Open a browser tab to Google's OAuth consent screen.
  2. Spin up a temporary localhost server to capture the auth code.
  3. Exchange the code for a refresh token.
  4. Print the refresh token. Copy it into the GitHub repo secret CWS_REFRESH_TOKEN.

Prereqs (one-time, in Google Cloud Console under your dev account):
  - Enable the Chrome Web Store API:
      https://console.cloud.google.com/apis/library/chromewebstore.googleapis.com
  - Create OAuth 2.0 Client ID (Application type: "Desktop app"):
      https://console.cloud.google.com/apis/credentials
  - Copy the client_id and client_secret.

Usage:
  python3 scripts/get-refresh-token.py <client_id> <client_secret>
"""

import http.server
import socketserver
import sys
import threading
import urllib.parse
import urllib.request
import webbrowser
import json
import secrets

SCOPE = "https://www.googleapis.com/auth/chromewebstore"
PORT = 8723

class Handler(http.server.BaseHTTPRequestHandler):
    captured = {}

    def do_GET(self):
        qs = urllib.parse.urlparse(self.path).query
        params = dict(urllib.parse.parse_qsl(qs))
        Handler.captured.update(params)
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.end_headers()
        body = (
            "<html><body style='font-family:sans-serif;padding:40px;'>"
            "<h2>Captured.</h2>"
            "<p>You can close this tab and return to your terminal.</p>"
            "</body></html>"
        )
        self.wfile.write(body.encode("utf-8"))

    def log_message(self, *_):
        return  # silence

def main():
    if len(sys.argv) != 3:
        print(__doc__, file=sys.stderr)
        sys.exit(1)

    client_id, client_secret = sys.argv[1], sys.argv[2]
    redirect = f"http://localhost:{PORT}"
    state = secrets.token_urlsafe(16)

    auth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth?"
        + urllib.parse.urlencode({
            "client_id": client_id,
            "redirect_uri": redirect,
            "response_type": "code",
            "scope": SCOPE,
            "access_type": "offline",
            "prompt": "consent",
            "state": state,
        })
    )

    srv = socketserver.TCPServer(("localhost", PORT), Handler)
    t = threading.Thread(target=srv.serve_forever, daemon=True)
    t.start()

    print(f"\nOpening browser to authorize... (if it doesn't open, paste this URL):\n  {auth_url}\n")
    webbrowser.open(auth_url)

    while "code" not in Handler.captured:
        pass

    srv.shutdown()

    if Handler.captured.get("state") != state:
        print(f"State mismatch — aborting", file=sys.stderr)
        sys.exit(2)

    code = Handler.captured["code"]
    print("Got auth code. Exchanging for tokens...")

    req = urllib.request.Request(
        "https://oauth2.googleapis.com/token",
        data=urllib.parse.urlencode({
            "code": code,
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uri": redirect,
            "grant_type": "authorization_code",
        }).encode("utf-8"),
        method="POST",
    )
    with urllib.request.urlopen(req) as resp:
        tokens = json.loads(resp.read().decode("utf-8"))

    refresh = tokens.get("refresh_token")
    if not refresh:
        print("No refresh_token returned. Response was:", file=sys.stderr)
        print(json.dumps(tokens, indent=2), file=sys.stderr)
        sys.exit(3)

    print("\n" + "=" * 60)
    print("Refresh token (paste into GitHub repo secret CWS_REFRESH_TOKEN):")
    print("=" * 60)
    print(refresh)
    print("=" * 60 + "\n")

if __name__ == "__main__":
    main()
