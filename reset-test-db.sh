#!/bin/bash
set -e

echo "🔄 Resetting database to clean seed state..."
echo ""

cd /app/backend

echo "📦 Step 1: Running database reset..."
node reset-db.js

echo ""
echo "📦 Step 2: Applying current menu (34 products)..."
node update-kake-menu.mjs

echo ""
echo "✅ Database reset complete!"
echo ""
echo "Expected counts:"
echo "  - Users: 15"
echo "  - Products: 34 (active, non-archived)"
echo "  - Orders: 12"
echo ""
