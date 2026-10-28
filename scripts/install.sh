#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
npm run build
SITE="$HOME/.local/share/study-app/site"
mkdir -p "$(dirname "$SITE")"
rm -rf "$SITE"
cp -R dist "$SITE"
rm -rf "$SITE/data"
/usr/bin/python3 "$HOME/.claude/bin/study-app-publish.py"
