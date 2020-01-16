#!/usr/bin/env zsh

set -e

npx tsc
npx webpack
mkdir -p dist/www/ && /bin/cp -r www dist/
for x in dist/lam/*-bundle.js; do zip --junk-paths ${x%js}zip $x; done
