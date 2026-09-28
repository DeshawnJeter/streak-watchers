#!/bin/bash
echo "🦉 Starting Duolingo Clone..."
echo ""

# Kill any existing processes on our ports
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null
sleep 1

# Start server
echo "🚀 Starting API server on port 3001..."
cd "$(dirname "$0")/server" && node index.js &
SERVER_PID=$!
sleep 2

# Start client
echo "⚡ Starting React app on port 3000..."
cd "$(dirname "$0")/client" && node ../node_modules/.bin/vite --port 3000 &
CLIENT_PID=$!
sleep 3

echo ""
echo "✅ App running at: http://localhost:3000"
echo ""
echo "Demo login: demo@demo.com / demo123"
echo ""
echo "Press Ctrl+C to stop."

open http://localhost:3000

# Cleanup on exit
trap "kill $SERVER_PID $CLIENT_PID 2>/dev/null; echo 'Stopped.'" EXIT
wait
