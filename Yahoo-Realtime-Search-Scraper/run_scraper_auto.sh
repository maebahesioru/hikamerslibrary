#!/bin/bash
# Yahoo Realtime Search Scraper - 自動実行ラッパー
# Hermes cron job用: 毎日前日のツイートをスクレイピングしてDB+TSV保存、GitHubにプッシュ
set -euo pipefail

REPO_DIR="/mnt/c/Users/maeba/Desktop/hikamerslibrary"
SCRAPER_DIR="$REPO_DIR/Yahoo-Realtime-Search-Scraper"
YESTERDAY=$(date -d "yesterday" '+%Y-%m-%d')
YEAR=$(date -d "yesterday" '+%Y')
TSV_FILE="$REPO_DIR/public/$YEAR/$YESTERDAY.tsv"

echo "=== Yahoo Scraper Auto-Run ==="
echo "Date: $YESTERDAY"
echo "Started: $(date)"

# 1. 依存パッケージの確認・インストール
cd "$SCRAPER_DIR"
pip3 install httpx orjson python-dotenv regex psycopg2-binary -q 2>&1 | tail -1

# 2. スクレイパー実行（TSV + PostgreSQL両方）
echo ""
echo "Running scraper for $YESTERDAY..."
python3 cli_scraper.py \
    --date "$YESTERDAY" \
    --output "$TSV_FILE" \
    --timeout 10 \
    --parallel 5
SCRAPE_EXIT=$?

if [ $SCRAPE_EXIT -ne 0 ]; then
    echo "WARNING: Scraper exited with code $SCRAPE_EXIT"
fi

# 3. 変更があったらGitHubにプッシュ
cd "$REPO_DIR"
mkdir -p "public/$YEAR/"
git add "public/$YEAR/" 2>/dev/null || true
git add "Yahoo-Realtime-Search-Scraper/" 2>/dev/null || true

if git diff --cached --quiet; then
    echo "No changes to commit."
else
    echo "Committing and pushing..."
    git commit -m "chore: daily scrape $YESTERDAY [auto]"
    git push origin main
    echo "Pushed to GitHub."
fi

echo ""
echo "=== Done: $(date) ==="
