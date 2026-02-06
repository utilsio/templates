#!/bin/bash
set -e

# Prebuild script for nextjs template
# Converts workspace dependencies to npm versions before release

echo "🔧 Preparing nextjs template for release..."

# Switch to npm version for @utilsio/react
echo "📦 Converting local config to NPM package config..."
bun run use:npm

# Verify the change
if grep -q '"@utilsio/react": "latest"' package.json; then
  echo "✅ Successfully converted to npm version"
else
  echo "❌ Failed to convert dependency version"
  exit 1
fi

echo "✨ Prebuild complete!"
