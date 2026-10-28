#!/usr/bin/env bash
set -euo pipefail
REPO=malishq/study-app
gh repo edit "$REPO" --visibility public --accept-visibility-change-consequences
gh api -X POST "repos/$REPO/pages" -f 'source[branch]=gh-pages' -f 'source[path]=/' >/dev/null 2>&1 \
  || gh api -X PUT "repos/$REPO/pages" -f 'source[branch]=gh-pages' -f 'source[path]=/' >/dev/null
echo "Готово: https://malishq.github.io/study-app/ появится через минуту-две."
