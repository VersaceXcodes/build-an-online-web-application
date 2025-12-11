#!/bin/bash
echo "Testing preview command..."
echo "Checking if dist directory exists..."
ls -la dist/ 2>&1 | head -5

echo -e "\nAttempting to start preview server..."
timeout 5s npx vite preview --host 0.0.0.0 --port 4173 2>&1 &
PREVIEW_PID=$!

sleep 2

echo -e "\nChecking if preview server is running..."
curl -I http://localhost:4173 2>&1 | head -10 || echo "Preview server not responding"

kill $PREVIEW_PID 2>/dev/null
