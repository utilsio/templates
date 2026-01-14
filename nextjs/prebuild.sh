#!/bin/bash
set -e

# Prebuild script for nextjs template
# Converts workspace dependencies to npm versions before release

echo "🔧 Preparing nextjs template for release..."

# Switch to npm version for @utilsio/react
echo "📦 Converting workspace:* to >=0.1.0..."
sed -i '' 's/"@utilsio\/react": "workspace:\*"/"@utilsio\/react": ">=0.1.0"/g' package.json

# Verify the change
if grep -q '"@utilsio/react": ">=0.1.0"' package.json; then
  echo "✅ Successfully converted to npm version"
else
  echo "❌ Failed to convert dependency version"
  exit 1
fi

echo "✨ Prebuild complete!"
