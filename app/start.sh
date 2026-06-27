#!/bin/bash

# FOS Visit Tracker - Start Script
# This script starts both the backend server and frontend client

echo "=========================================="
echo "  FOS Visit Tracker - Starting App"
echo "=========================================="
echo ""

# Check if node_modules exists for server
if [ ! -d "server/node_modules" ]; then
    echo "Installing server dependencies..."
    cd server && npm install && cd ..
fi

# Check if node_modules exists for client
if [ ! -d "node_modules" ]; then
    echo "Installing client dependencies..."
    npm install
fi

# Check if .env exists for server
if [ ! -f "server/.env" ]; then
    echo "Creating server .env from example..."
    cp server/.env.example server/.env
    echo "Please update server/.env with your database credentials"
fi

echo "Starting backend server on port 5000..."
echo "Starting frontend client on port 3000..."
echo ""

# Start both using concurrently
npm run dev