#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
bash scripts/build-friends.sh "$HOME/mirea-sdo-bot/app"
/usr/bin/python3 "$HOME/mirea-sdo-bot/publish.py"
