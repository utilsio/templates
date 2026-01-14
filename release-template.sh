#!/bin/bash
set -e

# Release script for utilsio templates
# Usage: ./release-template.sh <template-name>
# Example: ./release-template.sh nextjs

if [ -z "$1" ]; then
  echo "❌ Error: Template name required"
  echo "Usage: ./release-template.sh <template-name>"
  echo "Example: ./release-template.sh nextjs"
  exit 1
fi

TEMPLATE_NAME="$1"
TEMPLATE_DIR="$TEMPLATE_NAME"

# Check if template directory exists
if [ ! -d "$TEMPLATE_DIR" ]; then
  echo "❌ Error: Template directory '$TEMPLATE_DIR' not found"
  echo "Available templates:"
  ls -d */ 2>/dev/null | grep -v node_modules | sed 's/\///'
  exit 1
fi

# Check if prebuild.sh exists in template directory
if [ ! -f "$TEMPLATE_DIR/prebuild.sh" ]; then
  echo "❌ Error: prebuild.sh not found in $TEMPLATE_DIR/"
  echo "Please create $TEMPLATE_DIR/prebuild.sh first"
  exit 1
fi

echo "🚀 Releasing template: $TEMPLATE_NAME"
echo "================================================"

# Step 1: Run prebuild script
echo ""
echo "Step 1/4: Running prebuild script..."
cd "$TEMPLATE_DIR"
chmod +x prebuild.sh
./prebuild.sh

# Step 2: Show git status
echo ""
echo "Step 2/4: Git status"
git status --short

# Step 3: Stage changes
echo ""
echo "Step 3/4: Staging changes..."
git add package.json

# Step 4: Commit and push
echo ""
echo "Step 4/4: Ready to commit and push"
echo ""
echo "📝 Changes staged:"
git diff --cached --stat

echo ""
echo "================================================"
echo "✨ Prebuild complete! Next steps:"
echo ""
echo "1. Review the changes above"
echo "2. Commit with:"
echo "   git commit -m 'chore: prepare $TEMPLATE_NAME template for release'"
echo "3. Push with:"
echo "   git push"
echo ""
echo "Or run this one-liner to commit and push:"
echo "   git commit -m 'chore: prepare $TEMPLATE_NAME template for release' && git push"
echo ""
