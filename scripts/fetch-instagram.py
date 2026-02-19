#!/usr/bin/env python3
"""
conte.jpeg — Instagram投稿取得スクリプト
Instagram Graph APIから最新投稿を取得し、index.htmlを更新する
"""

import json
import os
import re
import sys
import urllib.request
import urllib.error

INSTAGRAM_TOKEN = os.environ.get('INSTAGRAM_TOKEN', '')
POST_COUNT = 9
SITE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX_HTML = os.path.join(SITE_DIR, 'index.html')


def fetch_instagram_posts():
    """Instagram Graph APIから最新投稿を取得"""
    if not INSTAGRAM_TOKEN:
        print('Error: INSTAGRAM_TOKEN not set')
        sys.exit(1)

    # Get user ID
    url = f'https://graph.instagram.com/me?fields=id,username&access_token={INSTAGRAM_TOKEN}'
    try:
        with urllib.request.urlopen(url) as res:
            user = json.loads(res.read())
            print(f"User: {user.get('username', 'unknown')}")
    except urllib.error.HTTPError as e:
        print(f'Error fetching user: {e.code} {e.read().decode()}')
        sys.exit(1)

    # Get recent media
    url = (
        f"https://graph.instagram.com/me/media"
        f"?fields=id,media_type,media_url,thumbnail_url,permalink,caption,timestamp"
        f"&limit={POST_COUNT}"
        f"&access_token={INSTAGRAM_TOKEN}"
    )
    try:
        with urllib.request.urlopen(url) as res:
            data = json.loads(res.read())
    except urllib.error.HTTPError as e:
        print(f'Error fetching media: {e.code} {e.read().decode()}')
        sys.exit(1)

    posts = []
    for item in data.get('data', []):
        media_type = item.get('media_type', '')
        # Use thumbnail for videos, media_url for images
        if media_type == 'VIDEO':
            img_url = item.get('thumbnail_url', '')
        elif media_type == 'CAROUSEL_ALBUM':
            img_url = item.get('media_url', '')
        else:
            img_url = item.get('media_url', '')

        if img_url:
            posts.append({
                'url': img_url,
                'permalink': item.get('permalink', 'https://www.instagram.com/conte.jpeg/'),
                'caption': item.get('caption', '')[:50] if item.get('caption') else 'Instagram post',
            })

    print(f'Fetched {len(posts)} posts')
    return posts


def refresh_token():
    """長期トークンを更新（有効期限60日 → リフレッシュで延長）"""
    if not INSTAGRAM_TOKEN:
        return None

    url = (
        f"https://graph.instagram.com/refresh_access_token"
        f"?grant_type=ig_refresh_token"
        f"&access_token={INSTAGRAM_TOKEN}"
    )
    try:
        with urllib.request.urlopen(url) as res:
            data = json.loads(res.read())
            new_token = data.get('access_token')
            print(f"Token refreshed, expires in {data.get('expires_in', 0) // 86400} days")
            return new_token
    except urllib.error.HTTPError as e:
        print(f'Token refresh failed: {e.code}')
        return None


def update_html(posts):
    """index.htmlのInstagramグリッドを更新"""
    with open(INDEX_HTML, 'r', encoding='utf-8') as f:
        html = f.read()

    # Build new grid HTML
    items = []
    for post in posts:
        alt = post['caption'].replace('"', '&quot;') if post['caption'] else 'Instagram post'
        items.append(
            f'      <a href="{post["permalink"]}" target="_blank" rel="noopener" class="instagram-item">'
            f'\n        <img src="{post["url"]}" alt="{alt}" loading="lazy">'
            f'\n      </a>'
        )
    new_grid = '\n'.join(items)

    # Replace instagram-grid contents
    pattern = r'(<div class="instagram-grid[^"]*"[^>]*>)\s*(.*?)\s*(</div>)'
    match = re.search(pattern, html, re.DOTALL)
    if not match:
        print('Error: Could not find instagram-grid in HTML')
        sys.exit(1)

    new_html = html[:match.start(2)] + '\n' + new_grid + '\n    ' + html[match.end(2):]

    with open(INDEX_HTML, 'w', encoding='utf-8') as f:
        f.write(new_html)

    print(f'Updated {INDEX_HTML} with {len(posts)} Instagram posts')


if __name__ == '__main__':
    # Refresh token
    new_token = refresh_token()

    # Fetch and update
    posts = fetch_instagram_posts()
    if posts:
        update_html(posts)
