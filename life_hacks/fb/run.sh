#!/usr/bin/env -S bash

touch checkpoint.txt
npm init -y
npm add js-yaml luxon selenium-webdriver winston
npm add -D tsx
npx tsx fb_auto_pressing.ts
