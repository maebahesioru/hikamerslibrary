#!/usr/bin/env python3
"""
Yahoo Realtime Scraper - プロキシ自動ローテーション付きラッパー
1. 複数の無料HTTPプロキシから日本のものを取得
2. 各プロキシをYahoo APIでテスト
3. 最も速い動作プロキシを使ってscraperを実行
"""
import asyncio
import subprocess
import sys
import json
import os
import time
import urllib.request

PROXY_API = 'https://api.proxyscrape.com/v2/?request=displayproxies&protocol=http&timeout=10000&country=JP&ssl=all&anonymity=all'

# テスト用のYahoo URL（軽量クエリ）
TEST_URL = 'https://search.yahoo.co.jp/realtime/api/v1/pagination?p=%E3%83%84%E3%82%A4%E3%83%BC%E3%83%88&results=1'

# フォールバック用の既知プロキシ
FALLBACK_PROXIES = [
    'http://43.155.208.105:80',
    'http://116.80.64.7:3172',
    'http://116.80.64.13:3172',
]

async def get_proxy_list():
    """APIから日本のHTTPプロキシ一覧を取得"""
    try:
        import httpx
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(PROXY_API)
            proxies = [f'http://{p.strip()}' for p in resp.text.strip().split('\n') if p.strip() and '.' in p and ':' in p]
            return proxies if proxies else FALLBACK_PROXIES
    except:
        return FALLBACK_PROXIES

async def test_proxy(proxy_url):
    """単一プロキシがYahoo APIで使えるかテスト"""
    try:
        import httpx
        async with httpx.AsyncClient(proxy=proxy_url, timeout=8) as client:
            start = time.time()
            resp = await client.get(TEST_URL, headers={
                'Accept': 'application/json',
                'Referer': 'https://search.yahoo.co.jp/realtime/search',
            })
            elapsed = time.time() - start
            if resp.status_code == 200 and resp.text.strip().startswith('{'):
                data = resp.json()
                total = data.get('timeline', {}).get('head', {}).get('totalResultsAvailable', 0)
                return True, elapsed, total
            return False, elapsed, 0
    except:
        return False, 999, 0

async def find_best_proxy(max_proxies=30):
    """最速の動作プロキシを見つける"""
    print("🔍 プロキシ自動検出中...")
    all_proxies = await get_proxy_list()
    print(f"  候補: {len(all_proxies)}件")
    
    best_proxy = None
    best_latency = 999
    
    # 最初にフォールバックを試す
    test_queue = FALLBACK_PROXIES + [p for p in all_proxies if p not in FALLBACK_PROXIES]
    test_queue = test_queue[:max_proxies]
    
    sem = asyncio.Semaphore(10)
    
    async def test_one(proxy):
        nonlocal best_proxy, best_latency
        ok, lat, _ = await test_proxy(proxy)
        if ok and lat < best_latency:
            best_latency = lat
            best_proxy = proxy
            print(f"  ✅ {proxy} ({lat:.1f}s)")
    
    tasks = [test_one(p) for p in test_queue]
    await asyncio.gather(*tasks)
    
    if best_proxy:
        print(f"\n➡ 使用プロキシ: {best_proxy} ({best_latency:.1f}s)")
        return best_proxy
    
    print("  ⚠️ 動作プロキシなし → フォールバック: http://43.155.208.105:80")
    return 'http://43.155.208.105:80'

async def main():
    # 引数パース
    cli_args = sys.argv[1:] if len(sys.argv) > 1 else []
    
    # プロキシを自動検出
    proxy_url = await find_best_proxy()
    
    # 環境変数設定
    env = os.environ.copy()
    env['YAHOO_PROXY'] = proxy_url
    env['PYTHONUNBUFFERED'] = '1'
    
    # スクリプトパス
    script_dir = os.path.dirname(os.path.abspath(__file__))
    scraper_script = os.path.join(script_dir, 'cli_scraper.py')
    
    print(f"\n🚀 スクレイパー実行...")
    print(f"  Proxy: {proxy_url}")
    print(f"  Args: {' '.join(cli_args)}")
    print()
    
    # cli_scraper.pyを実行
    proc = await asyncio.create_subprocess_exec(
        sys.executable, scraper_script, *cli_args,
        cwd=script_dir,
        env=env,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    
    stdout, stderr = await proc.communicate()
    
    # 出力を表示（データが取れたかどうかで色分け）
    output = stdout.decode('utf-8', errors='replace')
    print(output)
    
    if stderr:
        print(stderr.decode('utf-8', errors='replace'), file=sys.stderr)
    
    # 結果のキー行を抽出（API用）
    result = {
        'exit_code': proc.returncode,
        'proxy': proxy_url,
    }
    
    for line in output.split('\n'):
        if '件のツイートを取得' in line:
            import re
            m = re.search(r'(\d+)件', line)
            if m:
                result['tweets_found'] = int(m.group(1))
        if 'DB総件数' in line:
            import re
            m = re.search(r'([\d,]+)件', line)
            if m:
                result['db_total'] = m.group(1)
    
    print(f"\n{'='*50}")
    print(f"完了: 終了コード={proc.returncode}, tweets={result.get('tweets_found', '?')}")
    
    # API呼び出し元にJSONで結果を渡す（ファイル出力）
    result_file = os.environ.get('RESULT_FILE')
    if result_file:
        with open(result_file, 'w') as f:
            json.dump(result, f)
    
    return proc.returncode

if __name__ == '__main__':
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
