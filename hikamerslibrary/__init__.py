#!/usr/bin/env python3
"""
HikamersLibrary API
完全自動 Yahoo Realtime 検索スクレイピング

usage:
    from hikamerslibrary import scrape
    scrape(date="2026-03-01")
    scrape(date="2026-05-01~2026-05-31")
"""

import subprocess
import os
from datetime import datetime

script_dir = os.path.dirname(os.path.abspath(__file__))
cli_scraper = os.path.join(script_dir, 'cli_scraper.py')

def scrape(date: str, parallel: int = 1, proxy: str = None):
    """
    Yahoo Realtime 検索を自動実行
    
    Args:
        date: 検索対象日 (YYYY-MM-DD or YYYY-MM-DD~YYYY-MM-DD)
        parallel: 同時接続数
        proxy: SOCKS5 プロキシ URL（例："socks5h://127.0.0.1:40000"）
    
    Returns:
        tuple: (success, tweet_count, output)
    """
    cmd = [
        'python3', '-u', cli_scraper,
        '--date', date,
        '--parallel', str(parallel),
        '--timeout', '30',
        '--tsv-only',
        '--no-resolve-ids',
        '--skip-members-userid-fill'
    ]
    
    if proxy:
        cmd.extend(['--proxy', proxy])
    
    result = subprocess.run(
        cmd,
        cwd=os.path.join(script_dir, '../Yahoo-Realtime-Search-Scraper'),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        timeout=3600
    )
    
    if result.returncode == 0:
        output = result.stderr
        if '検索完了' in output:
            parts = output.split('検索完了:')
            if len(parts) > 1:
                count_part = parts[-1].split()[0]
                return True, count_part, None
        else:
            return True, '結果不明', None
    else:
        return False, None, result.stderr

def scrape_range(start: str, end: str, proxy: str = None):
    """
    日付範囲で自動スクレイピング
    
    Args:
        start: 開始日 (YYYY-MM-DD)
        end: 終了日 (YYYY-MM-DD)
        proxy: SOCKS5 プロキシ URL
    
    Returns:
        list: 取得した日付のリスト
    """
    results = []
    
    for date in range(start, end):
        date_str = date.strftime('%Y-%m-%d')
        success, count, error = scrape(date_str, proxy=proxy)
        if success:
            results.append({
                'date': date_str,
                'success': True,
                'count': count
            })
        else:
            results.append({
                'date': date_str,
                'success': False,
                'error': error
            })
    
    return results

if __name__ == '__main__':
    # Demo
    success, count, error = scrape('2026-05-28')
    print(f"成功: {success}")
    print(f"件数: {count}")
    print(f"エラー: {error}")
