const CACHE_VERSION = 'v5';
const STATIC_CACHE = `hikamers-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `hikamers-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `hikamers-images-${CACHE_VERSION}`;

// 静的リソース（必ずキャッシュ）
const STATIC_ASSETS = [
  '/',
  '/search',
  '/ai',
  '/hikamer-dx',
  '/faq',
  '/about',
  '/how-to-use',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/logo.png',
  '/offline.html'
];

// オフラインページHTML
const OFFLINE_HTML = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>オフライン - HikamersSearch</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #1a1a1a;
      color: #e8eaed;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      text-align: center;
    }
    .logo { font-size: 48px; margin-bottom: 24px; }
    h1 { font-size: 24px; margin-bottom: 16px; }
    p { color: #9aa0a6; margin-bottom: 24px; line-height: 1.6; }
    button {
      background: #4285f4;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 24px;
      font-size: 16px;
      cursor: pointer;
    }
    button:hover { background: #3367d6; }
  </style>
</head>
<body>
  <div class="logo">📡</div>
  <h1>オフラインです</h1>
  <p>インターネット接続がありません。<br>接続を確認してもう一度お試しください。</p>
  <button onclick="location.reload()">再読み込み</button>
</body>
</html>
`;

// インストール
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      cache.put('/offline.html', new Response(OFFLINE_HTML, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      }));
      return Promise.allSettled(
        STATIC_ASSETS.map(url => cache.add(url).catch(() => {}))
      );
    })
  );
  self.skipWaiting();
});

// アクティベート
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.filter(key => !key.includes(CACHE_VERSION)).map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// フェッチ
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 同一オリジンのみ、GETのみ処理
  if (url.origin !== location.origin || request.method !== 'GET') {
    return;
  }

  // APIはキャッシュしない
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // 画像
  if (request.destination === 'image' || url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  // 静的リソース
  if (request.destination === 'script' || request.destination === 'style' || request.destination === 'font') {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // HTMLページ
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithOffline(request));
    return;
  }
});

// キャッシュ優先
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('', { status: 404 });
  }
}

// ネットワーク優先（オフラインフォールバック）
async function networkFirstWithOffline(request) {
  try {
    const response = await fetch(request);
    if (response.ok && response.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    
    const offlinePage = await caches.match('/offline.html');
    return offlinePage || new Response(OFFLINE_HTML, {
      status: 503,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
}
