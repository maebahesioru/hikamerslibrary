#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Yahoo Realtime Search Scraper - 自動実行スクリプト
前日のツイートをスクレイピングしてTSV + Cloud SQL (PostgreSQL)に保存
"""

import os
import sys
import subprocess
from datetime import datetime, timedelta
from pathlib import Path

def print_header(title):
    """ヘッダーを表示"""
    print("=" * 60)
    print(title)
    print("=" * 60)
    print()

def main():
    print_header("Yahoo Realtime Search Scraper (TSV + PostgreSQL)")
    
    # 前日の日付を取得
    yesterday_date = datetime.now() - timedelta(days=1)
    yesterday = yesterday_date.strftime('%Y-%m-%d')
    year = yesterday_date.strftime('%Y')
    
    # パス設定
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    year_dir = project_root / "public" / year
    
    year_dir.mkdir(parents=True, exist_ok=True)
    
    output_file = year_dir / f"{yesterday}.tsv"
    
    print(f"検索対象日: {yesterday}")
    print(f"TSV出力先: {output_file}")
    print(f"PostgreSQL: 有効 [OK] (.env.localから取得)")
    print()
    
    # スクレイピング実行
    print("スクレイピング開始...")
    
    cmd = [
        sys.executable,
        str(script_dir / "cli_scraper.py"),
        "--date", yesterday,
        "--output", str(output_file),
        "--timeout", "10"
    ]
    
    try:
        result = subprocess.run(
            cmd,
            check=True,
            cwd=str(script_dir)
        )
        print()
        print(f"スクレイピング完了: {yesterday}.tsv + PostgreSQL")
        print()
    except subprocess.CalledProcessError as e:
        print()
        print(f"エラー: スクレイピングに失敗しました (終了コード: {e.returncode})")
        return 1
    
    print_header("すべての処理が完了しました")
    return 0


if __name__ == "__main__":
    try:
        exit_code = main()
        input("\nEnterキーを押して終了...")
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print()
        print("処理が中断されました")
        input("\nEnterキーを押して終了...")
        sys.exit(1)
    except Exception as e:
        print()
        print(f"予期しないエラーが発生しました: {e}")
        import traceback
        traceback.print_exc()
        input("\nEnterキーを押して終了...")
        sys.exit(1)
