#!/usr/bin/env zsh

npx tsc \
&& npx webpack \
&& mkdir -p dist/www/ && cp -r www/ dist/ \
&& cd dist/lam && for x in *-bundle.js; do zip ${x%js}zip $x; done
