#!/bin/bash
# Run this whenever you want to push updates to the live URL
# Usage: bash update.sh

SOURCE="/Users/nettaw/Downloads/Harmony_Funnel_extracted"
DEPLOY="/Users/nettaw/Downloads/aria-funnel-deploy"

echo "📦 Copying latest files..."
cp "$SOURCE/aria-home-flow.html" "$DEPLOY/index.html"
cp "$SOURCE/round-13.jsx" "$DEPLOY/round-13.jsx"

echo "🚀 Pushing to GitHub..."
cd "$DEPLOY"
git add .
git commit -m "Update $(date '+%Y-%m-%d %H:%M')"
git push

echo ""
echo "✅ Done! Live at: https://nettawit.github.io/aria-funnel/"
echo "   (refresh in ~30 seconds)"
