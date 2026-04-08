#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Yahoo Realtime Search Scraper - CLI版（超高速化版）
asyncio + httpx(HTTP/2) で Yahoo Realtime JSON API 並列取得
TSVとCloud SQL (PostgreSQL)に出力
"""

import argparse
import asyncio
import csv
import os
import sys
from datetime import datetime, timedelta, timezone
from urllib.parse import urlparse
import regex
import httpx
import orjson

# メンバー一覧（DBより優先して検索対象ハンドルに使う）
DEFAULT_MEMBERS_CSV = 'members_2026-03-21T12-35-40.csv'

# User-Agent設定
USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

# Yahoo リアルタイム検索 JSON API（yahoo-realtime-api.md）。HTML / __NEXT_DATA__ は使わない。
REALTIME_API_URL = 'https://search.yahoo.co.jp/realtime/api/v1/pagination'
REALTIME_RESULTS_PER_PAGE = 40  # API 上の最大

# プリコンパイル済み正規表現（高速化）
RE_STATUS_ID = regex.compile(r'/status/([0-9]+)')
RE_START = regex.compile(r'\s*START\s*', regex.IGNORECASE)
RE_END = regex.compile(r'\s*END\s*', regex.IGNORECASE)
RE_WHITESPACE = regex.compile(r'\s+')

# Jina Reader 経由の x.com/i/user/{rest_id} からスクリーン名を拾う（Title 行）
RE_JINA_PROFILE_TITLE = regex.compile(r'Title:[^\n]*\(@([^)]+)\)\s*/\s*X', regex.IGNORECASE)

# 新スキーマのカラム順序
TSV_COLUMNS = [
    'id', 'createdAt', 'displayText', 'lang', 'source',
    'replyCount', 'rtCount', 'qtCount', 'likesCount', 'viewCount', 'bookmarkCount',
    'mediaType', 'media', 'urls', 'hashtags', 'mentions',
    'inReplyToUserId', 'inReplyToScreenName', 'inReplyToTweetId',
    'quotedTweetId', 'quotedTweetText',
    'userId', 'userName', 'userRestId', 'userDescription',
    'userFollowersCount', 'userFollowingCount', 'userTweetCount', 'userCreatedAt',
    'userProfileImageUrl', 'userProfileBannerUrl', 'userVerified', 'userLocation'
]

# TSV → DB カラムマッピング
TSV_TO_DB = {
    'id': 'id', 'createdAt': 'created_at', 'displayText': 'display_text',
    'lang': 'lang', 'source': 'source', 'replyCount': 'reply_count',
    'rtCount': 'rt_count', 'qtCount': 'qt_count', 'likesCount': 'likes_count',
    'viewCount': 'view_count', 'bookmarkCount': 'bookmark_count',
    'mediaType': 'media_type', 'media': 'media', 'urls': 'urls',
    'hashtags': 'hashtags', 'mentions': 'mentions',
    'inReplyToUserId': 'in_reply_to_user_id', 'inReplyToScreenName': 'in_reply_to_screen_name',
    'inReplyToTweetId': 'in_reply_to_tweet_id', 'quotedTweetId': 'quoted_tweet_id',
    'quotedTweetText': 'quoted_tweet_text', 'userId': 'user_id', 'userName': 'user_name',
    'userRestId': 'user_rest_id', 'userDescription': 'user_description',
    'userFollowersCount': 'user_followers_count', 'userFollowingCount': 'user_following_count',
    'userTweetCount': 'user_tweet_count', 'userCreatedAt': 'user_created_at',
    'userProfileImageUrl': 'user_profile_image_url', 'userProfileBannerUrl': 'user_profile_banner_url',
    'userVerified': 'user_verified', 'userLocation': 'user_location'
}

DB_COLUMNS = list(TSV_TO_DB.values())
INT_COLUMNS = {'reply_count', 'rt_count', 'qt_count', 'likes_count', 'view_count', 
               'bookmark_count', 'user_followers_count', 'user_following_count', 'user_tweet_count'}


def parse_json(text):
    """高速JSONパース（orjson）"""
    return orjson.loads(text)


def format_list_field(data, field_type='default'):
    """リスト型フィールドを文字列に変換"""
    if not data:
        return ''
    
    if field_type == 'media':
        urls = []
        for item in data:
            if isinstance(item, dict):
                inner = item.get('item', {})
                # mediaUrl優先（実際の画像URL）、なければurl（t.co短縮URL）
                url = inner.get('mediaUrl') or item.get('mediaUrl') or inner.get('url') or item.get('url', '')
                if url:
                    urls.append(url)
            elif isinstance(item, str):
                urls.append(item)
        return ', '.join(urls) if urls else ''
    
    elif field_type == 'mediaType':
        if isinstance(data, list):
            return ', '.join(str(t) for t in data if t)
        return str(data) if data else ''
    
    elif field_type == 'urls':
        urls = []
        for item in data:
            if isinstance(item, dict):
                url = item.get('expandedUrl') or item.get('url', '')
                if url:
                    urls.append(url)
            elif isinstance(item, str):
                urls.append(item)
        return ', '.join(urls) if urls else ''
    
    elif field_type == 'hashtags':
        if isinstance(data, list):
            tags = []
            for item in data:
                if isinstance(item, dict):
                    tags.append(item.get('text', ''))
                elif isinstance(item, str):
                    tags.append(item)
            return ', '.join(t for t in tags if t)
        return ''
    
    elif field_type == 'mentions':
        if isinstance(data, list):
            names = []
            for item in data:
                if isinstance(item, dict):
                    name = item.get('screenName') or item.get('name', '')
                    if name:
                        names.append(f"@{name}")
                elif isinstance(item, str):
                    names.append(item)
            return ', '.join(names) if names else ''
        return ''
    
    return str(data) if data else ''


def parse_entry_to_new_schema(entry):
    """Yahoo APIエントリーを新スキーマに変換"""
    created_at_raw = entry.get('createdAt', '')
    created_datetime = None
    created_at = ''
    
    if created_at_raw and str(created_at_raw).isdigit():
        jst = timezone(timedelta(hours=9))
        created_datetime = datetime.fromtimestamp(int(created_at_raw), tz=jst)
        created_at = created_datetime.strftime('%Y-%m-%d %H:%M:%S JST')
    
    display_text = entry.get('displayText', '')
    if display_text:
        # プリコンパイル済み正規表現を使用
        display_text = RE_START.sub('', display_text)
        display_text = RE_END.sub('', display_text)
        display_text = RE_WHITESPACE.sub(' ', display_text).strip()
    
    tweet_id = entry.get('id', '')
    if not tweet_id and 'url' in entry:
        match = RE_STATUS_ID.search(entry['url'])
        if match:
            tweet_id = match.group(1)
    
    badge = entry.get('badge', {})
    user_verified = ''
    if badge and badge.get('show'):
        badge_type = badge.get('type', '')
        if badge_type == 'blue':
            user_verified = 'true'
        elif badge_type:
            user_verified = badge_type
    
    in_reply_to = entry.get('inReplyTo', '')
    in_reply_to_user_id = ''
    if in_reply_to and isinstance(in_reply_to, dict):
        in_reply_to_user_id = in_reply_to.get('userId', '')
    elif in_reply_to and isinstance(in_reply_to, str):
        in_reply_to_user_id = in_reply_to
    
    return {
        'id': str(tweet_id),
        'createdAt': created_at,
        'createdDateTime': created_datetime,
        'displayText': display_text,
        'lang': '',
        'source': '',
        'replyCount': str(entry.get('replyCount', 0)),
        'rtCount': str(entry.get('rtCount', 0)),
        'qtCount': str(entry.get('qtCount', 0)),
        'likesCount': str(entry.get('likesCount', 0)),
        'viewCount': '',
        'bookmarkCount': '',
        'mediaType': format_list_field(entry.get('mediaType', []), 'mediaType'),
        'media': format_list_field(entry.get('media', []), 'media'),
        'urls': format_list_field(entry.get('urls', []), 'urls'),
        'hashtags': format_list_field(entry.get('hashtags', []), 'hashtags'),
        'mentions': format_list_field(entry.get('mentions', []), 'mentions'),
        'inReplyToUserId': in_reply_to_user_id,
        'inReplyToScreenName': '',
        'inReplyToTweetId': '',
        'quotedTweetId': '',
        'quotedTweetText': '',
        'userId': entry.get('screenName', ''),
        'userName': entry.get('name', ''),
        'userRestId': str(entry.get('userId', '')),
        'userDescription': '',
        'userFollowersCount': '',
        'userFollowingCount': '',
        'userTweetCount': '',
        'userCreatedAt': '',
        'userProfileImageUrl': entry.get('profileImage', ''),
        'userProfileBannerUrl': '',
        'userVerified': user_verified,
        'userLocation': '',
    }


async def enrich_media_with_fxtwitter(results):
    """mediaありのツイートをfxtwitter APIでpbs.twimg.comに変換"""
    media_tweets = [r for r in results if r.get('media')]
    if not media_tweets:
        return
    
    print(f"\nfxtwitter APIでmedia URL変換中... ({len(media_tweets)}件)")
    
    sem = asyncio.Semaphore(20)
    
    async def fetch_one(session, result):
        tweet_id = result.get('id')
        if not tweet_id:
            return
        url = f"https://api.fxtwitter.com/status/{tweet_id}"
        try:
            async with sem:
                r = await session.get(url)
                data = parse_json(r.text)
            
            tweet = data.get('tweet', {})
            media = tweet.get('media', {})
            urls = []
            for photo in media.get('photos', []):
                if photo.get('url'):
                    urls.append(photo['url'])
            for video in media.get('videos', []):
                if video.get('thumbnail_url'):
                    urls.append(video['thumbnail_url'])
            if urls:
                result['media'] = ', '.join(urls)
        except Exception:
            pass
    
    headers = {'User-Agent': USER_AGENT}
    async with httpx.AsyncClient(headers=headers, timeout=10, follow_redirects=True) as client:
        await asyncio.gather(*[fetch_one(client, r) for r in media_tweets])
    
    print(f"[OK] media URL変換完了")


class AsyncYahooScraper:
    """非同期Yahoo検索スクレイパー（HTTP/2 + 圧縮対応）"""
    
    def __init__(self, max_concurrent=1, timeout=10):
        self.max_concurrent = max_concurrent
        self.timeout = timeout  # タイムアウト短縮で応答なしを早めに諦める
        self.results_data = []
        self.semaphore = None
    
    async def fetch_realtime_api_json(self, client, params):
        """GET REALTIME_API_URL → JSON dict（失敗時 None）"""
        try:
            async with self.semaphore:
                response = await client.get(REALTIME_API_URL, params=params)
                if response.status_code != 200:
                    return None
                return parse_json(response.text)
        except Exception:
            return None

    async def search_user(self, session, handle, start_date, end_date):
        """単一ユーザーの全ツイートを非同期検索（JSON API /pagination）"""
        keyword = f"@{handle}" if not handle.startswith('@') else handle
        keyword = f'ID:{keyword.replace("@", "")}'

        # since/until は ID: にも有効（実測: JST の日付窓にツイートがあれば返る）。
        # 窓内に 0 件のときは単にその期間にヒットがないだけ。日付は取得後にもフィルタして整合させる。
        params = {
            'p': keyword,
            'results': REALTIME_RESULTS_PER_PAGE,
        }
        all_results = []
        page_count = 0

        while page_count < 500:
            data = await self.fetch_realtime_api_json(session, params)
            if not data:
                break

            try:
                timeline = data.get('timeline') or {}
                entries = timeline.get('entry') or []

                if not entries:
                    break

                page_results = []
                for entry in entries:
                    try:
                        result = parse_entry_to_new_schema(entry)
                        page_results.append(result)
                    except Exception:
                        continue

                all_results.extend(page_results)
                page_count += 1

                # 日付チェック（ページ送り打ち切り）
                if page_results and start_date:
                    oldest_tweet_date = None
                    all_older = True

                    for result in page_results:
                        if result['createdDateTime']:
                            tweet_date = result['createdDateTime'].date()
                            if oldest_tweet_date is None or tweet_date < oldest_tweet_date:
                                oldest_tweet_date = tweet_date
                            if tweet_date >= start_date.date():
                                all_older = False

                    if all_older and oldest_tweet_date:
                        break
                    if oldest_tweet_date and oldest_tweet_date < (start_date.date() - timedelta(days=1)):
                        break

                last_id = entries[-1].get('id')
                if not last_id:
                    break
                params = {
                    'p': keyword,
                    'results': REALTIME_RESULTS_PER_PAGE,
                    'oldestTweetId': str(last_id),
                }

            except Exception:
                break

        # 日付範囲でフィルタ
        filtered = []
        for r in all_results:
            if r.get('createdDateTime'):
                d = r['createdDateTime'].date()
                if start_date.date() <= d <= end_date.date():
                    filtered.append(r)

        return handle, filtered

    async def parallel_search(self, handles, start_date, end_date=None):
        """全ユーザーを非同期並列検索（HTTP/2 + 圧縮対応）"""
        if end_date is None:
            end_date = start_date
        
        self.semaphore = asyncio.Semaphore(self.max_concurrent)
        
        # 共通ヘッダー（JSON API 用に Referer / Accept）
        headers = {
            'User-Agent': USER_AGENT,
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'ja,en;q=0.9',
            'Referer': 'https://search.yahoo.co.jp/realtime/search',
        }
        
        print(f"\n非同期並列検索開始 (同時接続数: {self.max_concurrent})")
        if start_date.date() == end_date.date():
            print(f"検索対象日: {start_date.strftime('%Y-%m-%d')}")
        else:
            print(f"検索対象期間: {start_date.strftime('%Y-%m-%d')} ~ {end_date.strftime('%Y-%m-%d')}")
        print(f"対象ユーザー数: {len(handles)}")
        print(f"[OK] Yahoo Realtime API: {REALTIME_API_URL}")
        print("[OK] HTTP/2対応 (httpx)")
        print("[OK] 高速JSONパーサー (orjson)")
        print("[OK] レスポンス圧縮 (gzip/brotli)")
        print(f"[OK] タイムアウト: {self.timeout}秒")
        print("-" * 60)
        
        limits = httpx.Limits(
            max_connections=self.max_concurrent,
            max_keepalive_connections=100
        )
        async with httpx.AsyncClient(
            http2=True,
            limits=limits,
            headers=headers,
            timeout=httpx.Timeout(self.timeout),
            follow_redirects=True
        ) as client:
            tasks = [self.search_user(client, h, start_date, end_date) for h in handles]
            await self._process_tasks(tasks, handles)
        
        print("-" * 60)
        print(f"検索完了: {len(self.results_data)}件のツイートを取得")
        return self.results_data
    
    async def _process_tasks(self, tasks, handles):
        """タスク処理の共通ロジック"""
        completed = 0
        total_tweets = 0
        
        for coro in asyncio.as_completed(tasks):
            handle, results = await coro
            completed += 1
            
            if results:
                self.results_data.extend(results)
                total_tweets += len(results)
                print(f"[OK] @{handle}: {len(results)}件")
            else:
                print(f"- @{handle}: 0件")
            
            if completed % 50 == 0:
                print(f"進行状況: {completed}/{len(handles)} ({total_tweets}件)")
    
    def group_tweets_by_date(self):
        """ツイートを日付別にグループ化"""
        from collections import defaultdict
        grouped = defaultdict(list)
        for result in self.results_data:
            if result.get('createdDateTime'):
                date_str = result['createdDateTime'].strftime('%Y-%m-%d')
                grouped[date_str].append(result)
        return grouped


def is_plausible_twitter_rest_id(s: str) -> bool:
    """
    X の user rest id（数値 snowflake）らしいか。
    プロフィール画像 URL や UserID 列への誤貼りを除外する。
    """
    t = (s or '').strip()
    if not t:
        return False
    tl = t.lower()
    if (
        'http' in tl
        or 'twimg' in tl
        or 'pbs.' in tl
        or 'profile_images' in tl
        or 'twitter.com' in tl
        or 'x.com' in tl
    ):
        return False
    if any(c in t for c in '/\\?#&='):
        return False
    if '.' in t:
        return False
    if not t.isdigit():
        return False
    # 古いアカウントは短い id もある（例: 6 桁）
    if len(t) < 5 or len(t) > 22:
        return False
    return True


def normalize_members_csv_user_id(s: str) -> str:
    """有効な rest id のみ返す。URL 等は空文字（UserID なし扱い）"""
    return (s or '').strip() if is_plausible_twitter_rest_id(s) else ''


def parse_x_profile_fields(url: str) -> tuple[str, str]:
    """
    ProfileURL から (rest_id, screen_name) を取る。
    - https://x.com/i/user/123... → ('123...', '')
    - https://x.com/screen_name → ('', 'screen_name')
    """
    t = (url or '').strip()
    if not t:
        return '', ''
    tl = t.lower()
    if 'twimg.com' in tl or 'profile_images' in tl:
        return '', ''
    try:
        p = urlparse(t)
        host = (p.netloc or '').lower()
        if 'twitter.com' not in host and 'x.com' not in host:
            return '', ''
        parts = [x for x in (p.path or '').split('/') if x]
        if len(parts) >= 3 and parts[0].lower() == 'i' and parts[1].lower() == 'user':
            cand = parts[2]
            if cand.isdigit() and is_plausible_twitter_rest_id(cand):
                return cand, ''
        if len(parts) >= 1:
            seg = parts[0]
            sl = seg.lower()
            if sl in (
                'i', 'intent', 'search', 'hashtag', 'explore', 'home',
                'settings', 'compose', 'messages',
            ):
                return '', ''
            if seg.isdigit() and is_plausible_twitter_rest_id(seg):
                return seg, ''
            return '', seg.lstrip('@')
    except Exception:
        pass
    return '', ''


def member_icon_is_missing(row: dict) -> bool:
    """Icon 列が空または未設定（FxTwitter で avatar を埋められる対象）"""
    return not (row.get('Icon') or '').strip()


def merge_members_csv_username_userid(row: dict) -> tuple[str, str]:
    """
    Username / UserID 列に加え、ProfileURL から取れる handle・数値 ID をマージする。
    戻り値: (username, user_id) ※どちらも正規化済み
    """
    raw_uid = (row.get('UserID') or '').strip()
    raw_un = (row.get('Username') or '').strip()
    prof = (row.get('ProfileURL') or '').strip()
    url_id, url_sn = parse_x_profile_fields(prof)
    uid = normalize_members_csv_user_id(raw_uid) or normalize_members_csv_user_id(url_id)
    un = raw_un or url_sn
    if un:
        un = un.lstrip('@').strip()
    return un, uid


def parse_members_csv_rows(csv_path):
    """members CSV を行 dict のリストにする（Username / UserID、ProfileURL 由来をマージ）"""
    rows = []
    with open(csv_path, 'r', encoding='utf-8-sig', newline='') as f:
        reader = csv.DictReader(f)
        for row in reader:
            un, uid = merge_members_csv_username_userid(dict(row))
            rows.append({
                'Username': un,
                'UserID': uid,
            })
    return rows


async def fill_missing_members_user_ids(
    csv_path: str,
    concurrency: int = 15,
    *,
    dry_run: bool = False,
    backup: bool = False,
) -> int:
    """
    members CSV で UserID / Icon が空または無効な箇所を補い、ファイルに書き戻す。
    1) ProfileURL から UserID（数値）を反映
    2) FxTwitter API で UserID（未設定時）および Icon 空欄時の avatar_url を反映
    戻り値: 補完した項目数の合計（ProfileURL の UserID + API の UserID + API の Icon）。
    """
    if not os.path.isfile(csv_path):
        return 0

    with open(csv_path, 'r', encoding='utf-8-sig', newline='') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        if not fieldnames or 'Username' not in fieldnames or 'UserID' not in fieldnames:
            return 0
        rows = list(reader)

    has_icon_col = 'Icon' in fieldnames

    filled_from_profile_url = 0
    for i, row in enumerate(rows):
        _, uid_merged = merge_members_csv_username_userid(row)
        cur = (row.get('UserID') or '').strip()
        if uid_merged and not is_plausible_twitter_rest_id(cur):
            rows[i]['UserID'] = uid_merged
            filled_from_profile_url += 1

    need_uid_idx = []
    need_icon_idx = []
    for i, row in enumerate(rows):
        un, uid = merge_members_csv_username_userid(rows[i])
        if un and not is_plausible_twitter_rest_id(uid):
            need_uid_idx.append(i)
        if has_icon_col and un and member_icon_is_missing(rows[i]):
            need_icon_idx.append(i)

    api_idx = sorted(set(need_uid_idx) | set(need_icon_idx))

    if not api_idx and filled_from_profile_url == 0:
        return 0

    if not api_idx:
        if filled_from_profile_url and not dry_run:
            if backup:
                bak = csv_path + '.bak'
                with open(csv_path, 'r', encoding='utf-8-sig', newline='') as src:
                    with open(bak, 'w', encoding='utf-8-sig', newline='') as dst:
                        dst.write(src.read())
            with open(csv_path, 'w', encoding='utf-8-sig', newline='') as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
                writer.writeheader()
                writer.writerows(rows)
        elif filled_from_profile_url and dry_run:
            print(f"[dry-run] ProfileURL から UserID を {filled_from_profile_url} 件補完できる")
        return filled_from_profile_url

    sem = asyncio.Semaphore(concurrency)
    results = {}

    limits = httpx.Limits(
        max_connections=concurrency + 5,
        max_keepalive_connections=concurrency + 5,
    )
    async with httpx.AsyncClient(http2=True, limits=limits, timeout=httpx.Timeout(25.0)) as client:

        async def one(idx: int):
            un, _ = merge_members_csv_username_userid(rows[idx])
            un = (un or '').strip().lstrip('@')
            if not un:
                return idx, None
            async with sem:
                user = await fxtwitter_get_user(client, un)
            return idx, user

        for coro in asyncio.as_completed([one(i) for i in api_idx]):
            idx, user = await coro
            results[idx] = user

    filled_uid_api = 0
    filled_icon_api = 0
    need_uid_set = set(need_uid_idx)
    need_icon_set = set(need_icon_idx)

    for idx in api_idx:
        user = results.get(idx)
        if not user:
            continue
        if idx in need_uid_set:
            rid = str(user.get('id', '')).strip() if user.get('id') is not None else ''
            if rid:
                rows[idx]['UserID'] = rid
                filled_uid_api += 1
        if has_icon_col and idx in need_icon_set:
            avatar = (user.get('avatar_url') or '').strip()
            if avatar:
                rows[idx]['Icon'] = avatar
                filled_icon_api += 1

    total_filled = filled_from_profile_url + filled_uid_api + filled_icon_api

    if total_filled == 0:
        return 0

    if dry_run:
        print(
            f"[dry-run] members CSV を {total_filled} 項目補完できる "
            f"(ProfileURL UserID: {filled_from_profile_url}, API UserID: {filled_uid_api}, API Icon: {filled_icon_api})"
            f"（ファイルは未変更）"
        )
        return total_filled

    if backup:
        bak = csv_path + '.bak'
        with open(csv_path, 'r', encoding='utf-8-sig', newline='') as src:
            with open(bak, 'w', encoding='utf-8-sig', newline='') as dst:
                dst.write(src.read())

    with open(csv_path, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
        writer.writeheader()
        writer.writerows(rows)

    return total_filled


async def fxtwitter_get_user(client, username):
    """api.fxtwitter.com からユーザー情報 JSON（失敗時 None）"""
    if not username:
        return None
    try:
        r = await client.get(
            f'https://api.fxtwitter.com/{username}',
            headers={'User-Agent': USER_AGENT, 'Accept': 'application/json'},
        )
        if r.status_code != 200:
            return None
        data = parse_json(r.text)
        if data.get('code') != 200 or not data.get('user'):
            return None
        return data['user']
    except Exception:
        return None


async def jina_resolve_screen_name_by_rest_id(client, rest_id):
    """数値 rest_id から現在のスクリーン名（Jina Reader 経由。失敗時 None）"""
    if not rest_id:
        return None
    url = f'https://r.jina.ai/http://x.com/i/user/{rest_id}'
    try:
        r = await client.get(url, headers={'User-Agent': USER_AGENT}, timeout=45.0)
        if r.status_code != 200:
            return None
        m = RE_JINA_PROFILE_TITLE.search(r.text)
        if not m:
            return None
        return m.group(1).strip().lstrip('@')
    except Exception:
        return None


async def resolve_one_rest_id(client, rest_id, username_fallback):
    """
    UserID がある行の最終ハンドル。
    1) Username で FxTwitter → 返却 id が UserID と一致なら screen_name（改名対応）
    2) 不一致・404・API 失敗時は Jina + x.com/i/user/{id}
    3) それでもダメなら CSV の Username
    """
    uid = str(rest_id).strip()
    un = (username_fallback or '').strip().lstrip('@')

    if un:
        user = await fxtwitter_get_user(client, un)
        if user:
            api_id = str(user.get('id', '')).strip()
            sn = (user.get('screen_name') or '').strip().lstrip('@')
            if api_id and sn and api_id == uid:
                return sn

    jn = await jina_resolve_screen_name_by_rest_id(client, uid)
    if jn:
        return jn

    return un or None


async def resolve_username_only(client, username):
    """UserID なし: FxTwitter で正規化、失敗時は CSV のまま"""
    un = (username or '').strip().lstrip('@')
    if not un:
        return None
    user = await fxtwitter_get_user(client, un)
    if user and user.get('screen_name'):
        return str(user['screen_name']).strip().lstrip('@')
    return un


async def resolve_members_csv_handles(rows, concurrency=30):
    """members CSV の全行を、UserID / 改名を踏まえてハンドル文字列に解決する"""
    if not rows:
        return []

    sem = asyncio.Semaphore(concurrency)
    ordered_uids = []
    seen_uid = set()
    for row in rows:
        uid = (row.get('UserID') or '').strip()
        if uid and uid not in seen_uid:
            seen_uid.add(uid)
            ordered_uids.append(uid)

    uid_first_row = {}
    for row in rows:
        uid = (row.get('UserID') or '').strip()
        if uid and uid not in uid_first_row:
            uid_first_row[uid] = row

    ordered_un_only = []
    seen_un = set()
    for row in rows:
        uid = (row.get('UserID') or '').strip()
        un = (row.get('Username') or '').strip().lstrip('@')
        if not uid and un and un not in seen_un:
            seen_un.add(un)
            ordered_un_only.append(un)

    uid_to_handle = {}
    un_only_to_handle = {}

    limits = httpx.Limits(max_connections=concurrency + 5, max_keepalive_connections=concurrency + 5)
    async with httpx.AsyncClient(http2=True, limits=limits, timeout=httpx.Timeout(60.0)) as client:

        async def run_uid(uid):
            async with sem:
                row = uid_first_row[uid]
                uid_to_handle[uid] = await resolve_one_rest_id(
                    client, uid, row.get('Username')
                )

        async def run_un_only(un):
            async with sem:
                un_only_to_handle[un] = await resolve_username_only(client, un)

        await asyncio.gather(
            *[run_uid(uid) for uid in ordered_uids],
            *[run_un_only(un) for un in ordered_un_only],
        )

    handles = []
    for row in rows:
        uid = (row.get('UserID') or '').strip()
        un = (row.get('Username') or '').strip().lstrip('@')
        if uid:
            h = uid_to_handle.get(uid)
        else:
            h = un_only_to_handle.get(un)
        if h:
            handles.append(h)

    return handles


def load_handles_from_db():
    """members CSV が無いときのフォールバック: DB の tweets から user_id を取得"""
    database_url = get_database_url()
    if not database_url:
        print(
            f"✗ エラー: {DEFAULT_MEMBERS_CSV} が無いか読めません。"
            " ファイルを配置するか DATABASE_URL を設定してください。",
            file=sys.stderr,
        )
        sys.exit(1)
    try:
        import psycopg2
        print("DBからユーザーリストを取得中...")
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        cur.execute("SELECT DISTINCT user_id FROM tweets WHERE user_id IS NOT NULL AND user_id != ''")
        handles = [row[0] for row in cur.fetchall()]
        conn.close()
        if not handles:
            print("✗ エラー: DBから取得できたユーザーが0件です", file=sys.stderr)
            sys.exit(1)
        print(f"[OK] DBから{len(handles)}件のユーザーを取得しました")
        return handles
    except Exception as e:
        print(f"✗ エラー: DB取得失敗: {e}", file=sys.stderr)
        sys.exit(1)


def get_existing_ids(filepath):
    """既存TSVファイルからIDを取得"""
    ids = set()
    if not os.path.exists(filepath):
        return ids
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            header = f.readline().strip().split('\t')
            id_idx = header.index('id') if 'id' in header else 0
            for line in f:
                cols = line.strip().split('\t')
                if len(cols) > id_idx and cols[id_idx]:
                    ids.add(cols[id_idx])
    except Exception as e:
        print(f"  既存ID読み込みエラー: {e}")
    return ids


def export_tsv(results_data, output_file):
    """結果をTSVでエクスポート（重複除去して追記）"""
    if not results_data:
        print("✗ エクスポートする結果がありません", file=sys.stderr)
        return False
    
    try:
        output_dir = os.path.dirname(output_file)
        if output_dir and not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        existing_ids = get_existing_ids(output_file)
        file_exists = os.path.exists(output_file) and len(existing_ids) > 0
        
        if existing_ids:
            print(f"  既存TSV: {len(existing_ids)}件")
        
        seen_ids = set()
        new_results = []
        for result in results_data:
            tid = result.get('id', '')
            if tid and tid not in existing_ids and tid not in seen_ids:
                seen_ids.add(tid)
                new_results.append(result)
        
        skipped = len(results_data) - len(new_results)
        if skipped > 0:
            print(f"  重複スキップ: {skipped}件")
        
        if not new_results:
            print(f"[OK] 新規ツイートなし（全て既存）")
            return True
        
        mode = 'a' if file_exists else 'w'
        with open(output_file, mode, newline='', encoding='utf-8') as f:
            if not file_exists:
                f.write('\t'.join(TSV_COLUMNS) + '\n')
            
            for result in new_results:
                row_values = []
                for field in TSV_COLUMNS:
                    value = result.get(field, '')
                    value_str = str(value).replace('\t', ' ').replace('\n', ' ').replace('\r', ' ')
                    row_values.append(value_str)
                f.write('\t'.join(row_values) + '\n')
        
        total = len(existing_ids) + len(new_results)
        print(f"[OK] TSV保存: {output_file}")
        print(f"  追加: +{len(new_results)}件 (総件数: {total}件)")
        return True
        
    except Exception as e:
        print(f"✗ TSVエクスポートエラー: {e}", file=sys.stderr)
        return False


def export_postgres(results_data, database_url):
    """結果をCloud SQL (PostgreSQL)にエクスポート"""
    if not results_data:
        print("✗ エクスポートする結果がありません", file=sys.stderr)
        return False
    
    try:
        import psycopg2
        from psycopg2.extras import execute_values
    except ImportError:
        import subprocess
        subprocess.run([sys.executable, '-m', 'pip', 'install', 'psycopg2-binary', '-q'])
        import psycopg2
        from psycopg2.extras import execute_values
    
    try:
        print(f"\nCloud SQL (PostgreSQL)に接続中...")
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        cur.execute("SELECT id FROM tweets")
        existing_ids = set(row[0] for row in cur.fetchall())
        
        new_results = [r for r in results_data if r.get('id') and r['id'] not in existing_ids]
        
        if not new_results:
            print("[OK] 新規ツイートなし（全て既存）")
            conn.close()
            return True
        
        print(f"  新規: {len(new_results)}件を挿入中...")
        
        def safe_int(val, default=0):
            if val is None or val == '':
                return default
            try:
                return int(float(val))
            except:
                return default
        
        values = []
        for result in new_results:
            row = []
            for tsv_col, db_col in TSV_TO_DB.items():
                val = result.get(tsv_col, '')
                if db_col in INT_COLUMNS:
                    val = safe_int(val)
                row.append(val)
            values.append(tuple(row))
        
        insert_sql = f"INSERT INTO tweets ({', '.join(DB_COLUMNS)}) VALUES %s ON CONFLICT (id) DO NOTHING"
        
        batch_size = 1000
        inserted = 0
        for i in range(0, len(values), batch_size):
            batch = values[i:i + batch_size]
            try:
                execute_values(cur, insert_sql, batch, page_size=1000)
                conn.commit()
                inserted += len(batch)
            except Exception as e:
                print(f"  バッチエラー: {e}")
                conn.rollback()
        
        cur.execute("SELECT COUNT(*) FROM tweets")
        total = cur.fetchone()[0]
        
        print(f"[OK] PostgreSQL: {inserted}件挿入")
        print(f"  DB総件数: {total:,}件")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"✗ PostgreSQLエラー: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return False


def rebuild_user_stats(database_url):
    """user_statsテーブルを再構築"""
    if not database_url:
        print("DATABASE_URL not found")
        return False
    
    try:
        import psycopg2
    except ImportError:
        import subprocess
        subprocess.run([sys.executable, '-m', 'pip', 'install', 'psycopg2-binary', '-q'])
        import psycopg2
    
    print("\n" + "=" * 60)
    print("user_stats テーブル再構築")
    print("=" * 60)
    
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    
    try:
        print("既存テーブルを削除中...")
        cur.execute("DROP TABLE IF EXISTS user_stats")
        conn.commit()
        
        print("user_statsテーブルを作成中（数分かかります）...")
        start = datetime.now()
        
        cur.execute("""
            CREATE TABLE user_stats AS
            WITH base_stats AS (
                SELECT user_id, MAX(user_name) as user_name,
                    COALESCE(MAX(NULLIF(user_profile_image_url, '')), '') as profile_image_url,
                    COALESCE(MAX(NULLIF(user_description, '')), '') as user_description,
                    SUM(COALESCE(likes_count, 0)) as total_likes,
                    SUM(COALESCE(rt_count, 0)) as total_rts,
                    SUM(COALESCE(view_count, 0)) as total_views,
                    SUM(COALESCE(reply_count, 0)) as total_replies,
                    SUM(COALESCE(qt_count, 0)) as total_quotes,
                    SUM(COALESCE(bookmark_count, 0)) as total_bookmarks,
                    COUNT(*) FILTER (WHERE media_type IS NOT NULL AND media_type != '') as media_count,
                    COUNT(*) as tweet_count,
                    MAX(COALESCE(user_followers_count, 0)) as max_followers,
                    MIN(COALESCE(user_followers_count, 0)) as min_followers,
                    MAX(COALESCE(user_following_count, 0)) as max_following,
                    MAX(COALESCE(user_tweet_count, 0)) as max_total_tweets,
                    MIN(user_created_at) as min_created_at,
                    MIN(created_at) as first_tweet_at,
                    MAX(created_at) as last_tweet_at,
                    SUM(CASE WHEN mentions IS NOT NULL AND mentions != '' THEN array_length(string_to_array(mentions, ','), 1) ELSE 0 END) as mention_count,
                    SUM(CASE WHEN hashtags IS NOT NULL AND hashtags != '' THEN array_length(string_to_array(hashtags, ','), 1) ELSE 0 END) as hashtag_count,
                    SUM(CASE WHEN urls IS NOT NULL AND urls != '' THEN array_length(string_to_array(urls, ','), 1) ELSE 0 END) as url_count,
                    COUNT(*) FILTER (WHERE in_reply_to_tweet_id IS NOT NULL AND in_reply_to_tweet_id != '') as reply_sent_count,
                    COUNT(*) FILTER (WHERE quoted_tweet_id IS NOT NULL AND quoted_tweet_id != '') as quote_sent_count,
                    COUNT(*) FILTER (WHERE media_type = 'video') as video_count,
                    COUNT(*) FILTER (WHERE media_type = 'photo') as photo_count,
                    SUM(CASE WHEN media_type IS NOT NULL AND media_type != '' THEN COALESCE(likes_count, 0) ELSE 0 END) as media_likes,
                    COUNT(DISTINCT hashtags) FILTER (WHERE hashtags IS NOT NULL AND hashtags != '') as unique_hashtag_sets,
                    COUNT(DISTINCT mentions) FILTER (WHERE mentions IS NOT NULL AND mentions != '') as unique_mention_sets,
                    COUNT(DISTINCT SUBSTRING(created_at FROM 1 FOR 7)) as active_months
                FROM tweets
                GROUP BY user_id HAVING COUNT(*) >= 1
            ),
            ranked AS (
                SELECT *,
                    PERCENT_RANK() OVER (ORDER BY total_likes) * 100 as pct_likes,
                    PERCENT_RANK() OVER (ORDER BY total_rts) * 100 as pct_rts,
                    PERCENT_RANK() OVER (ORDER BY total_replies) * 100 as pct_replies,
                    PERCENT_RANK() OVER (ORDER BY total_quotes) * 100 as pct_quotes,
                    PERCENT_RANK() OVER (ORDER BY total_bookmarks) * 100 as pct_bookmarks,
                    PERCENT_RANK() OVER (ORDER BY tweet_count) * 100 as pct_tweets,
                    PERCENT_RANK() OVER (ORDER BY reply_sent_count) * 100 as pct_reply_sent,
                    PERCENT_RANK() OVER (ORDER BY quote_sent_count) * 100 as pct_quote_sent,
                    CASE WHEN tweet_count > 0 THEN total_likes::numeric / tweet_count ELSE 0 END as avg_likes,
                    CASE WHEN tweet_count > 0 THEN total_rts::numeric / tweet_count ELSE 0 END as avg_rts,
                    CASE WHEN tweet_count > 0 THEN total_views::numeric / tweet_count ELSE 0 END as avg_views,
                    CASE WHEN total_views > 0 THEN (total_likes + total_rts + total_replies)::numeric * 100 / total_views ELSE 0 END as engagement_rate,
                    CASE WHEN total_likes > 0 THEN total_rts::numeric / total_likes ELSE 0 END as viral_coef,
                    CASE WHEN reply_sent_count > 0 THEN total_replies::numeric / reply_sent_count ELSE total_replies END as reply_ratio,
                    CASE WHEN media_count > 0 THEN media_likes::numeric / media_count ELSE 0 END as media_quality,
                    CASE WHEN min_followers > 0 THEN (max_followers - min_followers)::numeric / min_followers * 100 ELSE 0 END as follower_growth,
                    CASE WHEN tweet_count > 0 THEN (tweet_count - reply_sent_count - quote_sent_count)::numeric / tweet_count * 100 ELSE 0 END as originality,
                    active_months as continuity,
                    unique_hashtag_sets + unique_mention_sets as content_diversity
                FROM base_stats
            )
            SELECT *,
                (
                    pct_likes * 1.0 + pct_rts * 1.5 + pct_replies * 2.0 + pct_quotes * 1.8 + pct_bookmarks * 1.2 +
                    pct_tweets * 0.8 + pct_reply_sent * 1.0 + pct_quote_sent * 1.2 +
                    LEAST(viral_coef * 50, 50) +
                    LEAST(LN(1 + reply_ratio) * 15, 50) +
                    LEAST(LN(1 + media_quality) * 10, 30) +
                    LEAST(engagement_rate * 5, 50) +
                    LEAST(follower_growth * 0.5, 30) +
                    originality * 0.3 +
                    LEAST(continuity * 3, 36) +
                    LEAST(LN(1 + content_diversity) * 8, 25)
                ) as total_score
            FROM ranked
        """)
        conn.commit()
        
        elapsed = (datetime.now() - start).total_seconds()
        print(f"[OK] テーブル作成完了 ({elapsed:.1f}秒)")
        
        print("インデックス作成中...")
        cur.execute('CREATE INDEX idx_user_stats_user_id ON user_stats(user_id)')
        cur.execute('CREATE INDEX idx_user_stats_total_likes ON user_stats(total_likes DESC NULLS LAST)')
        cur.execute('CREATE INDEX idx_user_stats_total_rts ON user_stats(total_rts DESC NULLS LAST)')
        cur.execute('CREATE INDEX idx_user_stats_total_views ON user_stats(total_views DESC NULLS LAST)')
        cur.execute('CREATE INDEX idx_user_stats_tweet_count ON user_stats(tweet_count DESC NULLS LAST)')
        cur.execute('CREATE INDEX idx_user_stats_total_score ON user_stats(total_score DESC NULLS LAST)')
        conn.commit()
        
        cur.execute("SELECT COUNT(*) FROM user_stats")
        count = cur.fetchone()[0]
        print(f"[OK] user_stats: {count:,}ユーザー")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"✗ エラー: {e}")
        conn.rollback()
        conn.close()
        return False


def get_database_url():
    """DATABASE_URLを取得"""
    from dotenv import load_dotenv
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    
    env_local = os.path.join(project_root, '.env.local')
    if os.path.exists(env_local):
        load_dotenv(env_local)
    
    env_file = os.path.join(project_root, '.env')
    if os.path.exists(env_file):
        load_dotenv(env_file)
    
    return os.environ.get('DATABASE_URL', '')


def parse_date_range(date_str):
    """日付または日付範囲をパース"""
    if '~' in date_str:
        start_str, end_str = date_str.split('~')
        start_date = datetime.strptime(start_str.strip(), '%Y-%m-%d')
        end_date = datetime.strptime(end_str.strip(), '%Y-%m-%d')
        return start_date, end_date
    else:
        d = datetime.strptime(date_str.strip(), '%Y-%m-%d')
        return d, d


async def async_main(args):
    """非同期メイン処理"""
    if args.date:
        try:
            start_date, end_date = parse_date_range(args.date)
        except ValueError:
            print("✗ エラー: 日付形式が不正 (YYYY-MM-DD or YYYY-MM-DD~YYYY-MM-DD)", file=sys.stderr)
            sys.exit(1)
    else:
        start_date = end_date = datetime.now() - timedelta(days=1)
    
    database_url = args.database_url or get_database_url()
    
    print("=" * 60)
    print("Yahoo Realtime Search Scraper - 超高速版")
    print("=" * 60)
    if database_url:
        print("[OK] Cloud SQL (PostgreSQL) 利用可能")
    else:
        print("[WARN] DATABASE_URLなし（TSVのみ出力）")
    
    if start_date != end_date:
        days = (end_date - start_date).days + 1
        print(f"[OK] 日付範囲: {start_date.strftime('%Y-%m-%d')} ~ {end_date.strftime('%Y-%m-%d')} ({days}日間)")
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    members_path = os.path.join(script_dir, DEFAULT_MEMBERS_CSV)
    handles = None

    if os.path.isfile(members_path):
        try:
            if not args.skip_members_userid_fill:
                n_fill = await fill_missing_members_user_ids(
                    members_path,
                    concurrency=max(1, min(args.resolve_concurrency, 40)),
                )
                if n_fill:
                    print(
                        f"[OK] {DEFAULT_MEMBERS_CSV}: UserID / Icon など {n_fill} 項目を "
                        f"ProfileURL・FxTwitter で補完して保存しました"
                    )

            member_rows = parse_members_csv_rows(members_path)
            if member_rows:
                if args.no_resolve_ids:
                    handles = []
                    for r in member_rows:
                        u = (r.get('Username') or '').strip().lstrip('@')
                        if u:
                            handles.append(u)
                    print(f"[OK] {DEFAULT_MEMBERS_CSV} から {len(handles)} 件（--no-resolve-ids: CSV の Username のみ）")
                else:
                    print(f"\n{DEFAULT_MEMBERS_CSV}: UserID 照合・FxTwitter・必要時 Jina でハンドル解決中...")
                    handles = await resolve_members_csv_handles(
                        member_rows,
                        concurrency=args.resolve_concurrency,
                    )
                    print(f"[OK] {DEFAULT_MEMBERS_CSV} から {len(handles)} 件（DB より優先）")
        except Exception as e:
            print(f"[WARN] {DEFAULT_MEMBERS_CSV} 処理エラー: {e}。DB へフォールバック", file=sys.stderr)

    if handles is None:
        handles = load_handles_from_db()

    parallel = args.parallel if args.parallel is not None else max(1, len(handles))
    print(f"[OK] 同時接続数: {parallel}" + (" (ユーザー数と同じ)" if args.parallel is None else ""))
    scraper = AsyncYahooScraper(max_concurrent=parallel, timeout=args.timeout)
    await scraper.parallel_search(handles, start_date, end_date)
    await enrich_media_with_fxtwitter(scraper.results_data)
    
    success = True
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    
    if start_date == end_date:
        # 単一日付
        if args.output:
            output_file = args.output
        else:
            year = start_date.strftime('%Y')
            year_dir = os.path.join(project_root, 'public', year)
            os.makedirs(year_dir, exist_ok=True)
            output_file = os.path.join(year_dir, f"{start_date.strftime('%Y-%m-%d')}.tsv")
        
        if not args.db_only:
            if not export_tsv(scraper.results_data, output_file):
                success = False
        
        if not args.tsv_only and database_url:
            if not export_postgres(scraper.results_data, database_url):
                success = False
    else:
        # 複数日付: 日付別に振り分け
        grouped = scraper.group_tweets_by_date()
        
        print(f"\n日付別に振り分け中...")
        
        # TSV書き込み（並列）
        if not args.db_only:
            from concurrent.futures import ThreadPoolExecutor
            
            def write_tsv_for_date(date_str, tweets):
                year = date_str[:4]
                year_dir = os.path.join(project_root, 'public', year)
                os.makedirs(year_dir, exist_ok=True)
                output_file = os.path.join(year_dir, f"{date_str}.tsv")
                return export_tsv(tweets, output_file)
            
            with ThreadPoolExecutor(max_workers=len(grouped)) as executor:
                futures = {executor.submit(write_tsv_for_date, d, t): d for d, t in grouped.items()}
                for future in futures:
                    if not future.result():
                        success = False
        
        # DB挿入（1回の接続で全データ一括）
        if not args.tsv_only and database_url:
            all_tweets = scraper.results_data
            if not export_postgres(all_tweets, database_url):
                success = False
        
        total_saved = sum(len(t) for t in grouped.values())
        print(f"\n振り分け完了: {len(grouped)}日分, 計{total_saved}件")
    
    return success


def main():
    parser = argparse.ArgumentParser(description='Yahoo Realtime Search Scraper - 超高速版 (HTTP/2 + asyncio)')
    parser.add_argument('--date', type=str, help='検索対象日 (YYYY-MM-DD or YYYY-MM-DD~YYYY-MM-DD、省略時は前日)')
    parser.add_argument('--output', type=str, help='出力TSVファイルパス (日付範囲指定時は無視)')
    parser.add_argument('--parallel', type=int, default=None, help='同時接続数 (省略時はユーザー数)')
    parser.add_argument('--timeout', type=int, default=10, help='タイムアウト秒数 (デフォルト: 10)')
    parser.add_argument('--tsv-only', action='store_true', help='TSVのみ出力')
    parser.add_argument('--db-only', action='store_true', help='DBのみ出力')
    parser.add_argument('--database-url', type=str, help='PostgreSQL接続URL')
    parser.add_argument('--no-rebuild', action='store_true', help='user_stats再構築をスキップ')
    parser.add_argument('--no-resolve-ids', action='store_true',
                        help='members CSV の UserID 解決をせず Username のみ使う（オフライン想定）')
    parser.add_argument('--skip-members-userid-fill', action='store_true',
                        help='起動時の members CSV の UserID・Icon 自動補完（ProfileURL / FxTwitter）をしない')
    parser.add_argument('--resolve-concurrency', type=int, default=30,
                        help='UserID 補完・ハンドル解決の同時 HTTP 数（デフォルト: 30）')
    
    args = parser.parse_args()
    
    # Windows対応
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    
    success = asyncio.run(async_main(args))
    
    # user_stats再構築
    if success and not args.no_rebuild and not args.tsv_only:
        database_url = args.database_url or get_database_url()
        if database_url:
            rebuild_user_stats(database_url)
    
    if success:
        print("\n[OK] すべての処理が完了しました")
        sys.exit(0)
    else:
        print("\n✗ 一部エラーが発生しました", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
