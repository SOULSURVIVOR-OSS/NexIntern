#!/usr/bin/env bash
# Script to install dependencies and run the InternLoom Frontend (Vite)
set -e

echo "=================================================="
echo " Starting InternLoom AI Frontend (Port 3000)"
echo "=================================================="

cd "$(dirname "$0")/frontend"

if [ ! -d "node_modules" ]; then
    echo "[1/2] Installing npm dependencies..."
    npm install
fi

echo "[2/2] Launching Vite development server..."
echo "Opening on: http://localhost:3000"
npm run dev
