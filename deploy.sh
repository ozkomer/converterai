#!/bin/bash
set -e
cd /home/idearoot/idea.converter.api
echo ">>> Pulling latest code..."
git fetch --all
git reset --hard origin/main
echo ">>> Rebuilding containers..."
docker compose down
docker compose up -d --build
echo ">>> Deploy completed!"
