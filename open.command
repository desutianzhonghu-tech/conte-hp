#!/bin/bash
cd "$(dirname "$0")"

# Kill any existing server on port 8000
lsof -ti:8000 | xargs kill -9 2>/dev/null

# Start local server in background
python3 -m http.server 8000 &
SERVER_PID=$!

# Wait a moment for server to start
sleep 0.5

# Open in default browser
open "http://localhost:8000"

echo "conte.jpeg HP is running at http://localhost:8000"
echo "Press Ctrl+C to stop the server."

# Wait for Ctrl+C
trap "kill $SERVER_PID 2>/dev/null; exit" INT TERM
wait $SERVER_PID
