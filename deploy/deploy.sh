#!/usr/bin/env bash
# Build the static admin and publish it to the nginx root.
set -euo pipefail
cd "$(dirname "$0")/.."
npm ci --silent
npm run build
mkdir -p /var/www/shipnative-admin
rsync -a --delete out/ /var/www/shipnative-admin/
echo "published to /var/www/shipnative-admin"
