#!/bin/bash
cd /Users/zhangjizhan/.openclaw/workspace/devtools-site
echo "=== Checking ASCII page file ==="
ls -lh src/app/ascii/page.tsx
echo ""
echo "=== Removing .next cache ==="
rm -rf .next
echo ""
echo "=== Building project ==="
npx next build
echo ""
echo "=== Build complete ==="
