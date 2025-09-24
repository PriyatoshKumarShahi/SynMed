#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install deps
npm install

# Build frontend
npm run build

# Copy frontend build into backend for static serving
rm -rf backend/public
cp -r frontend/dist backend/public
