#!/usr/bin/env bash
# Script to install dependencies and run the NexIntern Frontend (Express + Vite)
set -e

echo "=================================================="
echo " Starting NexIntern Frontend (Port 3000)"
echo "=================================================="

cd "$(dirname "$0")/frontend"

echo "[1/2] Ensuring npm dependencies are installed..."
npm install

echo "[2/2] Launching server (tsx server.ts)..."
echo "Opening on: http://localhost:3000"
npm run dev
