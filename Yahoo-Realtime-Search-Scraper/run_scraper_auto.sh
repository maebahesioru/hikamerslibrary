#!/bin/bash
# Trigger the server-side scraper API
# This runs on WSL but the actual scraping happens on the server
set -euo pipefail

API_URL="https://hikamerslibrary.hikamer.f5.si/api/admin/scraper"
SECRET="hikamers-scraper-2026"
YESTERDAY=$(date -d "yesterday" '+%Y-%m-%d')

echo "=== Triggering server-side scraper ==="
echo "Date: $YESTERDAY"
echo "Started: $(date)"

# Call the API endpoint on the server
response=$(curl -s -X POST "${API_URL}?date=${YESTERDAY}&secret=${SECRET}" \
    --max-time 600 \
    -w "\n%{http_code}")

http_code=$(echo "$response" | tail -1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
    echo "✅ Scraper completed successfully"
    echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
elif [ "$http_code" = "401" ]; then
    echo "❌ Authentication failed"
else
    echo "⚠️ HTTP $http_code"
    echo "$body"
fi

echo ""
echo "=== Done: $(date) ==="
