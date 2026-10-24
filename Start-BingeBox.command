#!/bin/bash
cd "$(dirname "$0")" || exit 1
if ! command -v node >/dev/null 2>&1; then
  echo 'Install Node.js 18.20.8 for macOS first. See README.md.'
  read -r -p 'Press Return to close.'
  exit 1
fi
if [ ! -d node_modules ]; then
  npm ci || { read -r -p 'Install failed. Press Return to close.'; exit 1; }
fi
npm run dev
read -r -p 'Press Return to close.'
