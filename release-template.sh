#!/bin/bash
set -e

# Release script for utilsio templates
# Usage: ./release-template.sh <template-name>

if [ -z "$1" ]; then
  echo "❌ Error: Template name required"
  echo "Usage: ./release-template.sh <template-name>"
  exit 1
fi

TEMPLATE_NAME="$1"
TEMPLATE_DIR="$TEMPLATE_NAME"
COMMIT_MSG="chore: prepare $TEMPLATE_NAME template for release"

# Validate template directory
if [ ! -d "$TEMPLATE_DIR" ]; then
  echo "❌ Error: Template directory '$TEMPLATE_DIR' not found"
  exit 1
fi

# Validate prebuild.sh
if [ ! -f "$TEMPLATE_DIR/prebuild.sh" ]; then
  echo "❌ Error: prebuild.sh not found in $TEMPLATE_DIR/"
  exit 1
fi

echo "🚀 Releasing template: $TEMPLATE_NAME"
echo "================================================"

# Step 1: Run prebuild
echo ""
echo "Step 1/3: Running prebuild script..."
cd "$TEMPLATE_DIR"
chmod +x prebuild.sh
./prebuild.sh
cd ..

# Step 2: Git status (informational only)
echo ""
echo "Step 2/3: Git status (template only)"
git status --short "$TEMPLATE_DIR"

# Step 3: Stage + commit
echo ""
echo "Step 3/3: Committing release changes..."
git add "$TEMPLATE_DIR"

# Abort if nothing changed
if git diff --cached --quiet; then
  echo "ℹ️ No changes to commit. Exiting."
  exit 0
fi

git commit -m "$COMMIT_MSG"

echo ""
echo "✅ Template '$TEMPLATE_NAME' prepared for release"
echo "Next step:"
echo "  git push"
