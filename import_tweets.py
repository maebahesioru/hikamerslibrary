#!/usr/bin/env python3
"""
CSVファイルをTSVに変換して日付別に分配し、Cloud SQL (PostgreSQL)にも追加するスクリプト
"""

import csv
import os
import re
import json
from datetime import datetime, timedelta
from pathlib import Path
from collections import defaultdict
from dotenv import load_dotenv

# .env.local を優先的に読み込む
load_dotenv('.env.local')
load_dotenv('.env')

DATABASE_URL = os.getenv('DATABASE_URL', '')

# TSVカラム順序（既存TSVと同じ）
TSV_COLUMNS = [
    'id', 'createdAt', 'displayText', 'lang', 'source', 'replyCount', 'rtCount',
    'qtCount', 'likesCount', 'viewCount', 'bookmarkCount', 'mediaType', 'media',
    'urls', 'hashtags', 'mentions', 'inReplyToUserId', 'inReplyToScreenName',
    'inReplyToTweetId', 'quotedTweetId', 'quotedTweetText', 'userId', 'userName',
    'userRestId', 'userDescription', 'userFollowersCount', 'userFollowingCount',
    'userTweetCount', 'userCreatedAt', 'userProfileImageUrl', 'userProfileBannerUrl',
    'userVerified', 'userLocation'
]

# CSVカラム名のマッピング
COLUMN_MAP = {
    'in ReplyToUserId': 'inReplyToUserId',
}

# 新形式CSVのカラムマッピング (Twillot形式)
NEW_FORMAT_MAP = {
    'Post ID': 'id',
    'Created At': 'createdAt',
    'Content': 'displayText',
    'Language': 'lang',
    'Reply Count': 'replyCount',
    'Retweet Count': 'rtCount',
    'Quote Count': 'qtCount',
    'Favorite Count': 'likesCount',
    'Views Count': 'viewCount',
    'Bookmark Count': 'bookmarkCount',
    'Screen Name': 'userId',
    'Username': 'userName',
    'User ID': 'userRestId',
    'Avatar': 'userProfileImageUrl',
    'Media': 'media',
    'Link': 'urls',
    'Quoted Post': 'quotedTweetText',
}

# 新形式CSVのカラムマッピング (Nitter形式 - 新しいフォルダー)
NITTER_FORMAT_MAP = {
    'id': 'id',
    'createdAt': 'createdAt',
    'displayText': 'displayText',
    'replyCount': 'replyCount',
    'rtCount': 'rtCount',
    'likesCount': 'likesCount',
    'viewCount': 'viewCount',
    'mediaType': 'mediaType',
    'media': 'media',
    'urls': 'urls',
    'hashtags': 'hashtags',
    'mentions': 'mentions',
    'inReplyToScreenName': 'inReplyToScreenName',
    'quotedTweetId': 'quotedTweetId',
    'quotedTweetText': 'quotedTweetText',
    'userId': 'userRestId',  # 数値ID
    'userName': 'userName',
    'userScreenName': 'userId',  # @handle -> userId
    'userProfileImageUrl': 'userProfileImageUrl',
    'userDescription': 'userDescription',
    'userCreatedAt': 'userCreatedAt',
    'userTweetCount': 'userTweetCount',
    'userFollowingCount': 'userFollowingCount',
    'userFollowersCount': 'userFollowersCount',
    'userProfileBannerUrl': 'userProfileBannerUrl',
    'userVerified': 'userVerified',
    'userLocation': 'userLocation',
}

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


def safe_int(value, default=0):
    """安全に整数に変換"""
    if value is None or value == '':
        return default
    try:
        return int(float(value))
    except (ValueError, TypeError):
        return default


def clean_media(media_str):
    """メディアURLをクリーンアップ"""
    if not media_str:
        return ''
    if media_str.startswith('[') and media_str.endswith(']'):
        try:
            media_list = json.loads(media_str)
            if isinstance(media_list, list):
                return ','.join(media_list)
        except:
            pass
    return media_str


def convert_new_format(row: dict) -> dict:
    """新形式CSVを既存TSV形式に変換"""
    converted = {}
    
    # Twillot形式 (Post ID, Content等)
    if 'Post ID' in row or 'Content' in row:
        for new_key, old_key in NEW_FORMAT_MAP.items():
            if new_key in row:
                converted[old_key] = row[new_key]
        
        if 'createdAt' in converted and converted['createdAt']:
            date_str = converted['createdAt']
            if 'T' in date_str:
                try:
                    dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                    dt_jst = dt + timedelta(hours=9)
                    converted['createdAt'] = dt_jst.strftime('%Y-%m-%d %H:%M:%S') + ' JST'
                except:
                    pass
        
        media_type = 'なし'
        if row.get('Image') == 'true' or row.get('Image') == True:
            media_type = 'photo'
        elif row.get('Video') == 'true' or row.get('Video') == True:
            media_type = 'video'
        elif row.get('GIF') == 'true' or row.get('GIF') == True:
            media_type = 'gif'
        converted['mediaType'] = media_type
        
        if 'media' in converted and converted['media']:
            converted['media'] = clean_media(converted['media'])
        
        for col in TSV_COLUMNS:
            if col not in converted:
                converted[col] = ''
        
        return converted
    
    # Nitter形式 (userScreenName等)
    elif 'userScreenName' in row:
        for csv_key, tsv_key in NITTER_FORMAT_MAP.items():
            if csv_key in row:
                converted[tsv_key] = row[csv_key]
        
        # createdAtをJST形式に変換
        if 'createdAt' in converted and converted['createdAt']:
            converted['createdAt'] = convert_date_to_jst(converted['createdAt'])
        
        # userCreatedAtもJST形式に変換
        if 'userCreatedAt' in converted and converted['userCreatedAt']:
            converted['userCreatedAt'] = convert_date_to_jst(converted['userCreatedAt'])
        
        # mediaTypeが「画像」「動画」の場合は変換
        if 'mediaType' in converted:
            mt = converted['mediaType']
            if mt == '画像':
                converted['mediaType'] = 'photo'
            elif mt == '動画':
                converted['mediaType'] = 'video'
            elif not mt:
                converted['mediaType'] = 'なし'
        
        # 不足カラムを空文字で埋める
        for col in TSV_COLUMNS:
            if col not in converted:
                converted[col] = ''
        
        return converted
    
    # 既存形式（変換不要）
    else:
        return row


def parse_date(date_str: str) -> tuple:
    """日付文字列からYYYY-MM-DDを抽出"""
    if not date_str:
        return None, None
    
    match = re.match(r'(\d{4})-(\d{2})-(\d{2})', date_str)
    if match:
        year = match.group(1)
        date = f"{match.group(1)}-{match.group(2)}-{match.group(3)}"
        return year, date
    
    match = re.match(r'(\d{4})-(\d{2})-(\d{2})T', date_str)
    if match:
        year = match.group(1)
        date = f"{match.group(1)}-{match.group(2)}-{match.group(3)}"
        return year, date
    
    month_map = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
        'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
        'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    }
    match = re.match(r'(\w{3})\s+(\d{1,2}),\s+(\d{4})', date_str)
    if match:
        month = month_map.get(match.group(1))
        day = match.group(2).zfill(2)
        year = match.group(3)
        if month:
            date = f"{year}-{month}-{day}"
            return year, date
    
    return None, None


def convert_date_to_jst(date_str: str) -> str:
    """日付文字列をJST形式に変換"""
    if not date_str:
        return ''
    
    if 'JST' in date_str:
        return date_str
    
    month_map = {
        'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4,
        'May': 5, 'Jun': 6, 'Jul': 7, 'Aug': 8,
        'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
    }
    match = re.match(r'(\w{3})\s+(\d{1,2}),\s+(\d{4})\s+·\s+(\d{1,2}):(\d{2})\s+(AM|PM)\s+UTC', date_str)
    if match:
        month = month_map.get(match.group(1), 1)
        day = int(match.group(2))
        year = int(match.group(3))
        hour = int(match.group(4))
        minute = int(match.group(5))
        ampm = match.group(6)
        
        if ampm == 'PM' and hour != 12:
            hour += 12
        elif ampm == 'AM' and hour == 12:
            hour = 0
        
        utc_time = datetime(year, month, day, hour, minute)
        jst_time = utc_time + timedelta(hours=9)
        return jst_time.strftime('%Y-%m-%d %H:%M:%S') + ' JST'
    
    if 'T' in date_str and ('Z' in date_str or '+' in date_str):
        try:
            clean = date_str.replace('Z', '+00:00')
            utc_time = datetime.fromisoformat(clean)
            jst_time = utc_time + timedelta(hours=9)
            return jst_time.strftime('%Y-%m-%d %H:%M:%S') + ' JST'
        except:
            pass
    
    return date_str


def read_csv_file(filepath: str) -> list:
    """CSVファイルを読み込む（重複除去）"""
    tweets = []
    seen_ids = set()
    duplicates = 0
    try:
        with open(filepath, 'r', encoding='utf-8-sig') as f:  # utf-8-sig でBOM自動除去
            reader = csv.DictReader(f)
            for row in reader:
                normalized = {}
                for key, value in row.items():
                    if key is None:
                        continue
                    clean_key = key.strip().replace('\n', '').replace('\r', '').replace('\ufeff', '')
                    mapped_key = COLUMN_MAP.get(clean_key, clean_key)
                    normalized[mapped_key] = value.strip() if value else ''
                
                normalized = convert_new_format(normalized)
                
                if 'createdAt' in normalized:
                    normalized['createdAt'] = convert_date_to_jst(normalized['createdAt'])
                
                # CSV内重複チェック
                tweet_id = normalized.get('id', '')
                if tweet_id and tweet_id in seen_ids:
                    duplicates += 1
                    continue
                if tweet_id:
                    seen_ids.add(tweet_id)
                
                tweets.append(normalized)
        
        if duplicates > 0:
            print(f"  (CSV内重複スキップ: {duplicates}件)")
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
    return tweets


def group_by_date(tweets: list) -> dict:
    """ツイートを日付別にグループ化"""
    grouped = defaultdict(list)
    for tweet in tweets:
        created_at = tweet.get('createdAt', '')
        year, date = parse_date(created_at)
        if year and date:
            grouped[(year, date)].append(tweet)
        else:
            print(f"Warning: Invalid date format: {created_at}")
    return grouped


def append_to_tsv(filepath: str, tweets: list, existing_ids: set) -> int:
    """TSVファイルに追記（重複除去）"""
    # 追加対象から重複を除去（CSV内重複も考慮）
    seen_in_batch = set()
    new_tweets = []
    for t in tweets:
        tid = t.get('id')
        if tid and tid not in existing_ids and tid not in seen_in_batch:
            seen_in_batch.add(tid)
            new_tweets.append(t)
    
    if not new_tweets:
        return 0
    
    write_header = not os.path.exists(filepath)
    
    with open(filepath, 'a', encoding='utf-8', newline='') as f:
        if write_header:
            f.write('\t'.join(TSV_COLUMNS) + '\n')
        
        for tweet in new_tweets:
            row = []
            for col in TSV_COLUMNS:
                value = tweet.get(col, '')
                value = str(value).replace('\t', ' ').replace('\n', ' ').replace('\r', '')
                row.append(value)
            f.write('\t'.join(row) + '\n')
    
    return len(new_tweets)


def get_existing_ids(filepath: str) -> set:
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
                if len(cols) > id_idx:
                    ids.add(cols[id_idx])
    except Exception as e:
        print(f"Error reading existing IDs from {filepath}: {e}")
    return ids


def insert_to_postgres(tweets: list, batch_size: int = 1000) -> int:
    """Cloud SQL (PostgreSQL)にツイートを挿入（重複除去）"""
    if not DATABASE_URL:
        print("Warning: DATABASE_URL not found, skipping database insert")
        return 0
    
    # psycopg2インストール
    try:
        import psycopg2
        from psycopg2.extras import execute_values
    except ImportError:
        import subprocess
        import sys
        subprocess.run([sys.executable, '-m', 'pip', 'install', 'psycopg2-binary', '-q'])
        import psycopg2
        from psycopg2.extras import execute_values
    
    # 接続
    try:
        conn = psycopg2.connect(DATABASE_URL)
    except Exception as e:
        print(f"DB接続エラー: {e}")
        return 0
    
    cur = conn.cursor()
    
    # 既存IDを取得
    print("  既存ID取得中...")
    cur.execute("SELECT id FROM tweets")
    existing_ids = set(row[0] for row in cur.fetchall())
    print(f"  既存: {len(existing_ids):,}件")
    
    # 新規ツイートのみ抽出（入力内重複も除去）
    seen_ids = set()
    new_tweets = []
    for t in tweets:
        tid = t.get('id')
        if tid and tid not in existing_ids and tid not in seen_ids:
            seen_ids.add(tid)
            new_tweets.append(t)
    
    if not new_tweets:
        print("  新規ツイートなし")
        conn.close()
        return 0
    
    print(f"  新規: {len(new_tweets):,}件を挿入中...")
    
    # 変換
    values = []
    for tweet in new_tweets:
        row = []
        for tsv_col, db_col in TSV_TO_DB.items():
            val = tweet.get(tsv_col, '')
            if db_col in INT_COLUMNS:
                val = safe_int(val)
            elif db_col == 'media':
                val = clean_media(val)
            # NUL文字を除去
            if isinstance(val, str):
                val = val.replace('\x00', '')
            row.append(val)
        values.append(tuple(row))
    
    # 挿入
    insert_sql = f"INSERT INTO tweets ({', '.join(DB_COLUMNS)}) VALUES %s ON CONFLICT (id) DO NOTHING"
    
    inserted = 0
    for i in range(0, len(values), batch_size):
        batch = values[i:i + batch_size]
        try:
            execute_values(cur, insert_sql, batch, page_size=1000)
            conn.commit()
            inserted += len(batch)
            print(f"  {inserted:,}/{len(values):,} 挿入完了", end='\r')
        except Exception as e:
            print(f"\n  バッチ挿入エラー: {e}")
            conn.rollback()
    
    print()
    
    # 統計
    cur.execute("SELECT COUNT(*) FROM tweets")
    total = cur.fetchone()[0]
    print(f"  DB総件数: {total:,}件")
    
    conn.close()
    return inserted


def rebuild_user_stats():
    """user_statsテーブルを再構築"""
    if not DATABASE_URL:
        print("DATABASE_URL not found")
        return False
    
    try:
        import psycopg2
    except ImportError:
        import subprocess
        import sys
        subprocess.run([sys.executable, '-m', 'pip', 'install', 'psycopg2-binary', '-q'])
        import psycopg2
    
    print("\n" + "=" * 60)
    print("user_stats テーブル再構築")
    print("=" * 60)
    
    conn = psycopg2.connect(DATABASE_URL)
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
        print(f"✓ テーブル作成完了 ({elapsed:.1f}秒)")
        
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
        print(f"✓ user_stats: {count:,}ユーザー")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"✗ エラー: {e}")
        conn.rollback()
        conn.close()
        return False


def sync_tsv_to_postgres():
    """TSVファイルからPostgreSQLに同期（差分のみ）"""
    print("\n" + "=" * 60)
    print("TSV → PostgreSQL 同期")
    print("=" * 60)
    
    if not DATABASE_URL:
        print("DATABASE_URL not found")
        return
    
    try:
        import psycopg2
        from psycopg2.extras import execute_values
    except ImportError:
        import subprocess
        import sys
        subprocess.run([sys.executable, '-m', 'pip', 'install', 'psycopg2-binary', '-q'])
        import psycopg2
        from psycopg2.extras import execute_values
    
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    # 既存ID取得
    print("\n既存ID取得中...")
    cur.execute("SELECT id FROM tweets")
    existing_ids = set(row[0] for row in cur.fetchall())
    print(f"DB既存: {len(existing_ids):,}件")
    
    # TSVから読み込み
    public_dir = Path('public')
    all_tweets = []
    
    for year_dir in sorted(public_dir.iterdir()):
        if not year_dir.is_dir() or not year_dir.name.isdigit():
            continue
        
        for tsv_file in sorted(year_dir.glob('*.tsv')):
            try:
                with open(tsv_file, 'r', encoding='utf-8') as f:
                    header = f.readline().strip().split('\t')
                    for line in f:
                        cols = line.strip().split('\t')
                        while len(cols) < len(header):
                            cols.append('')
                        row = dict(zip(header, cols[:len(header)]))
                        tweet_id = row.get('id', '')
                        if tweet_id and tweet_id not in existing_ids:
                            all_tweets.append(row)
            except Exception as e:
                print(f"Error: {tsv_file} - {e}")
    
    print(f"新規ツイート: {len(all_tweets):,}件")
    
    if not all_tweets:
        print("同期完了（差分なし）")
        conn.close()
        return
    
    # 変換・挿入
    values = []
    for tweet in all_tweets:
        row = []
        for tsv_col, db_col in TSV_TO_DB.items():
            val = tweet.get(tsv_col, '')
            if db_col in INT_COLUMNS:
                val = safe_int(val)
            elif db_col == 'media':
                val = clean_media(val)
            # NUL文字を除去
            if isinstance(val, str):
                val = val.replace('\x00', '')
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
            print(f"  {inserted:,}/{len(values):,} 挿入完了", end='\r')
        except Exception as e:
            print(f"\nエラー: {e}")
            conn.rollback()
    
    print()
    
    cur.execute("SELECT COUNT(*) FROM tweets")
    total = cur.fetchone()[0]
    print(f"\n同期完了！ DB総件数: {total:,}件")
    
    conn.close()


def sync_postgres_to_tsv():
    """PostgreSQLからTSVに同期（差分のみ）"""
    print("\n" + "=" * 60)
    print("PostgreSQL → TSV 同期")
    print("=" * 60)
    
    if not DATABASE_URL:
        print("DATABASE_URL not found")
        return
    
    try:
        import psycopg2
    except ImportError:
        import subprocess
        import sys
        subprocess.run([sys.executable, '-m', 'pip', 'install', 'psycopg2-binary', '-q'])
        import psycopg2
    
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    # TSV既存ID取得
    print("\nTSV既存ID取得中...")
    public_dir = Path('public')
    tsv_ids = set()
    for year_dir in sorted(public_dir.iterdir()):
        if not year_dir.is_dir() or not year_dir.name.isdigit():
            continue
        for tsv_file in sorted(year_dir.glob('*.tsv')):
            with open(tsv_file, 'r', encoding='utf-8') as f:
                f.readline()  # skip header
                for line in f:
                    cols = line.split('\t')
                    if cols:
                        tsv_ids.add(cols[0])
    print(f"TSV既存: {len(tsv_ids):,}件")
    
    # DB IDのみ取得して差分計算
    print("DB ID取得中...")
    cur.execute("SELECT id FROM tweets")
    db_ids = set(row[0] for row in cur.fetchall())
    print(f"DB総件数: {len(db_ids):,}件")
    
    missing_ids = db_ids - tsv_ids
    print(f"TSV不足: {len(missing_ids):,}件")
    
    if not missing_ids:
        print("同期完了（差分なし）")
        conn.close()
        return
    
    # 不足分のみDBから取得
    print("不足データ取得中...")
    
    # DB→TSVカラムマッピング（逆引き）
    db_to_tsv = {v: k for k, v in TSV_TO_DB.items()}
    
    new_tweets = []
    batch_size = 10000
    missing_list = list(missing_ids)
    
    for i in range(0, len(missing_list), batch_size):
        batch_ids = missing_list[i:i + batch_size]
        placeholders = ','.join(['%s'] * len(batch_ids))
        cur.execute(f"SELECT * FROM tweets WHERE id IN ({placeholders})", batch_ids)
        columns = [desc[0] for desc in cur.description]
        
        for row in cur.fetchall():
            db_row = dict(zip(columns, row))
            tsv_row = {}
            for db_col, val in db_row.items():
                if db_col == 'embedding':  # embeddingカラムはスキップ
                    continue
                tsv_col = db_to_tsv.get(db_col, db_col)
                tsv_row[tsv_col] = str(val) if val is not None else ''
            new_tweets.append(tsv_row)
        
        print(f"  {min(i + batch_size, len(missing_list)):,}/{len(missing_list):,} 取得完了", end='\r')
    
    print()
    
    # 日付別にグループ化してTSVに追記
    # createdAtカラムを使用（DB名はcreated_at）
    grouped = defaultdict(list)
    invalid_date_count = 0
    for tweet in new_tweets:
        created_at = tweet.get('createdAt', '')
        year, date = parse_date(created_at)
        if year and date:
            grouped[(year, date)].append(tweet)
        else:
            invalid_date_count += 1
    
    if invalid_date_count > 0:
        print(f"警告: 日付形式が不正なデータ {invalid_date_count}件をスキップ")
    
    total_added = 0
    
    for (year, date), tweets in sorted(grouped.items()):
        year_dir = public_dir / year
        year_dir.mkdir(exist_ok=True)
        
        tsv_path = year_dir / f"{date}.tsv"
        existing_ids = get_existing_ids(str(tsv_path))
        added = append_to_tsv(str(tsv_path), tweets, existing_ids)
        
        if added > 0:
            print(f"  {date}: +{added} tweets")
            total_added += added
    
    print(f"\n同期完了！ TSV追加: {total_added:,}件")
    conn.close()


def count_tweets():
    """TSV総ツイート数を計算してDB件数と比較"""
    print("\n" + "=" * 60)
    print("ツイート統計")
    print("=" * 60)
    
    public_dir = Path('public')
    tsv_by_year = {}
    tsv_total = 0
    
    for year_dir in sorted(public_dir.iterdir()):
        if year_dir.is_dir() and year_dir.name.isdigit():
            year_count = 0
            for tsv_file in year_dir.glob('*.tsv'):
                with open(tsv_file, 'r', encoding='utf-8') as f:
                    lines = sum(1 for _ in f) - 1
                    year_count += max(0, lines)
            tsv_by_year[year_dir.name] = year_count
            tsv_total += year_count
    
    # DB件数取得
    db_total = 0
    if DATABASE_URL:
        try:
            import psycopg2
            conn = psycopg2.connect(DATABASE_URL)
            cur = conn.cursor()
            cur.execute("SELECT COUNT(*) FROM tweets")
            db_total = cur.fetchone()[0]
            conn.close()
        except:
            pass
    
    print(f"\nTSV総件数: {tsv_total:,}")
    print(f"DB総件数:  {db_total:,}")
    if tsv_total == db_total:
        print("✅ TSVとDBは一致しています")
    else:
        print(f"⚠️  差分: {abs(tsv_total - db_total):,}件")
    
    print("\n年別内訳:")
    print(f"{'年':<6} {'件数':>12}")
    print("-" * 20)
    for year in sorted(tsv_by_year.keys()):
        print(f"{year:<6} {tsv_by_year[year]:>12,}")
    
    return tsv_total, db_total, tsv_by_year


def main():
    import sys
    
    # 引数チェック
    if len(sys.argv) > 1:
        if sys.argv[1] == 'sync':
            # TSV → PostgreSQL 同期モード
            sync_tsv_to_postgres()
            # user_stats も更新
            rebuild_user_stats()
            return
        elif sys.argv[1] == 'reverse':
            # PostgreSQL → TSV 同期モード
            sync_postgres_to_tsv()
            return
        elif sys.argv[1] == 'count':
            # 統計表示モード
            count_tweets()
            return
        elif sys.argv[1] == 'rebuild':
            # user_stats再構築のみ
            rebuild_user_stats()
            return
    
    # 通常モード: CSVインポート
    source_dir = Path('新しいフォルダー')
    target_dir = Path('public')
    
    csv_files = list(source_dir.glob('*.csv'))
    print(f"Found {len(csv_files)} CSV files")
    
    if not csv_files:
        print("CSVファイルが見つかりません")
        print("\n使い方:")
        print("  py import_tweets.py        # 新しいフォルダーからインポート")
        print("  py import_tweets.py sync   # TSV → DB 同期 + user_stats更新")
        print("  py import_tweets.py reverse # DB → TSV 同期")
        print("  py import_tweets.py count  # 統計表示")
        print("  py import_tweets.py rebuild # user_stats再構築のみ")
        return
    
    # インポート前の統計
    print("\n" + "=" * 60)
    print("インポート前")
    print("=" * 60)
    before_tsv, before_db, _ = count_tweets()
    
    all_tweets = []
    seen_ids = set()
    
    print("\n" + "=" * 60)
    print("CSVインポート")
    print("=" * 60)
    
    for csv_file in csv_files:
        print(f"Reading {csv_file.name}...")
        tweets = read_csv_file(str(csv_file))
        print(f"  -> {len(tweets)} tweets")
        
        # 複数CSV間の重複除去
        for t in tweets:
            tid = t.get('id')
            if tid and tid not in seen_ids:
                seen_ids.add(tid)
                all_tweets.append(t)
    
    print(f"\nTotal: {len(all_tweets)} unique tweets")
    
    grouped = group_by_date(all_tweets)
    print(f"Grouped into {len(grouped)} date files")
    
    # TSVに追記
    total_added_tsv = 0
    for (year, date), tweets in sorted(grouped.items()):
        year_dir = target_dir / year
        year_dir.mkdir(exist_ok=True)
        
        tsv_path = year_dir / f"{date}.tsv"
        existing_ids = get_existing_ids(str(tsv_path))
        added = append_to_tsv(str(tsv_path), tweets, existing_ids)
        
        if added > 0:
            print(f"  {date}: +{added} tweets")
            total_added_tsv += added
    
    # PostgreSQLに挿入
    print("\nInserting to PostgreSQL...")
    inserted_db = insert_to_postgres(all_tweets)
    
    # インポート後の統計
    print("\n" + "=" * 60)
    print("インポート後")
    print("=" * 60)
    after_tsv, after_db, by_year = count_tweets()
    
    # リザルト表示
    print("\n" + "=" * 60)
    print("📊 インポート結果")
    print("=" * 60)
    print(f"CSV読み込み:     {len(all_tweets):,}件")
    print(f"TSV追加:         +{total_added_tsv:,}件 ({before_tsv:,} → {after_tsv:,})")
    print(f"DB追加:          +{inserted_db:,}件 ({before_db:,} → {after_db:,})")
    
    if after_tsv == after_db:
        print("\n✅ TSVとDBは一致しています")
    else:
        print(f"\n⚠️  TSVとDBに差分があります: {abs(after_tsv - after_db):,}件")
    
    print("\n✅ 完了!")


if __name__ == "__main__":
    main()
