#!/usr/bin/env bash
#
# Lazer Online — build + deploy the static frontend to Hostinger public_html.
#
# Usage:
#   npm run deploy                 # build (hostinger:build) + deploy frontend/out
#   npm run deploy -- --no-build   # deploy existing frontend/out without rebuilding
#   npm run deploy -- --plugin     # ALSO sync the headless-cli WordPress plugin
#
# Auth: passwordless SSH key at ~/.ssh/hostinger_lazer (set up once, no password needed).
# Safety: rsync runs WITHOUT --delete, so it never removes WordPress/WooCommerce
#         files already living in public_html; it only adds/updates the static export.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

KEY="$HOME/.ssh/hostinger_lazer"
PORT=65002
REMOTE="u870711808@82.198.228.131"
DOCROOT="/home/u870711808/domains/lazeronline.com.tr/public_html"
SSH_OPTS="ssh -p $PORT -i $KEY -o BatchMode=yes -o StrictHostKeyChecking=accept-new"

BUILD=1
SYNC_PLUGIN=0
for arg in "$@"; do
  case "$arg" in
    --no-build) BUILD=0 ;;
    --plugin)   SYNC_PLUGIN=1 ;;
  esac
done

if [ ! -f "$KEY" ]; then
  echo "ERROR: SSH key not found at $KEY" >&2
  echo "Run the one-time key setup again, or restore the key." >&2
  exit 1
fi

if [ "$BUILD" -eq 1 ]; then
  echo "==> Building static export (npm run hostinger:build)..."
  npm run hostinger:build
fi

if [ ! -d frontend/out ]; then
  echo "ERROR: frontend/out not found — nothing to deploy. Build first." >&2
  exit 1
fi

echo "==> Deploying frontend/out/ -> $REMOTE:$DOCROOT/"
rsync -az --stats -e "$SSH_OPTS" frontend/out/ "$REMOTE:$DOCROOT/"

if [ "$SYNC_PLUGIN" -eq 1 ]; then
  echo "==> Syncing headless-cli plugin..."
  rsync -az -e "$SSH_OPTS" \
    wordpress/wp-content/plugins/headless-cli/headless-cli.php \
    "$REMOTE:$DOCROOT/wp-content/plugins/headless-cli/headless-cli.php"
fi

echo "==> Verifying live homepage logo reference..."
curl -s https://lazeronline.com.tr/ | grep -oE 'lazer-online-yatay[a-z-]*\.png' | sort -u || true

echo "==> Deploy complete. Hard-refresh the site with Cmd+Shift+R to bypass browser cache."
