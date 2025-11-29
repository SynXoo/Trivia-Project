#!/bin/bash
# Start both backend and frontend servers
# Run from project root: ./scripts/start.sh or npm start

echo "🎮 Starting Trivia Game..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please run setup first:"
    echo "   ./scripts/setup.sh"
    exit 1
fi

if [ ! -d "node_modules" ] || [ ! -d "client/node_modules" ]; then
    echo "❌ Dependencies not installed. Please run setup first:"
    echo "   ./scripts/setup.sh"
    exit 1
fi

echo "🚀 Starting backend server on http://localhost:3000"
echo "🎨 Starting frontend server on http://localhost:4200"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

npx concurrently "node server-with-auth.js" "cd client && ng serve"