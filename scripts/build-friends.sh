#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
OUT="${1:-$HOME/mirea-sdo-bot/app}"
BASE_PATH=./ VITE_BOT_USERNAME= npm run build
rm -rf "$OUT"
mkdir -p "$OUT"
cp -R dist/. "$OUT"
rm -rf "$OUT/data"
echo "friends build copied to $OUT"
