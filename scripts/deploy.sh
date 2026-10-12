#!/usr/bin/env bash
#
# Baut die App fuer GitHub Pages und veroeffentlicht sie im gh-pages-Branch.
#
# Die App liegt dort nicht unter "/", sondern unter "/tao-app/". Deshalb wird
# NEXT_PUBLIC_BASE_PATH gesetzt: Next nimmt den Wert fuer basePath und
# assetPrefix, und die Teile, die Next NICHT umschreibt — gewoehnliche Anker
# (PageLink), Manifest, Service Worker, Precache-Liste — lesen denselben Wert.
#
# out/ liegt in .gitignore und kann darum nicht direkt gepusht werden. Der
# Branch entsteht stattdessen in einem eigenen Arbeitsverzeichnis und wird
# jedes Mal neu geschrieben: Eine Historie des Bauergebnisses hat keinen Wert,
# die Quellen liegen in main.
#
# Aufruf: ./scripts/deploy.sh
set -euo pipefail

BASE_PATH="/tao-app"
BRANCH="gh-pages"
REMOTE="origin"

cd "$(dirname "$0")/.."
ROOT="$(pwd)"

echo "==> Baue mit basePath ${BASE_PATH}"
NEXT_PUBLIC_BASE_PATH="${BASE_PATH}" npm run build

# .nojekyll ist zwingend: ohne die Datei ignoriert GitHub Pages jeden Ordner,
# dessen Name mit einem Unterstrich beginnt — und genau dort liegt _next.
if [ ! -f out/.nojekyll ]; then
  echo "==> .nojekyll fehlte, wird angelegt"
  touch out/.nojekyll
fi

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

echo "==> Stelle ${BRANCH} zusammen"
cp -r out/. "$WORK/"
cd "$WORK"
git init --quiet --initial-branch="$BRANCH"
git add --all
git -c user.name="$(git -C "$ROOT" config user.name)" \
    -c user.email="$(git -C "$ROOT" config user.email)" \
    commit --quiet -m "Deploy $(cd "$ROOT" && git rev-parse --short HEAD)"

echo "==> Veroeffentliche nach ${BRANCH}"
git push --force --quiet "$(git -C "$ROOT" remote get-url "$REMOTE")" "$BRANCH"

echo "==> Fertig: https://morphbreed.github.io${BASE_PATH}/"
