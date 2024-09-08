#!/bin/sh
set -e

echo "Migrating database..."
npm run db:migrate & PID=$!
wait $PID

echo "Starting production server..."
node server.js & PID=$!

wait $PID