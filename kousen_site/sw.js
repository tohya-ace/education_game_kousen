// 知育Webアプリ KouSen式 Service Worker
// ファイルを更新したら VERSION を上げてください（古いキャッシュが入れ替わります）
const VERSION = 'v18';
const CACHE = 'kousen-' + VERSION;
const FONT_CACHE = 'kousen-fonts';
const ASSETS = [
  './',
  './index.html',
  './korokoro_puzzle.html',
  './korokoro_craft.html',
  './anzan_timeattack.html',
  './chiba_puzzle.html',
  './food_jigsaw.html',
  './manifest.webmanifest',
  './img/puzzle.webp',
  './img/craft.webp',
  './img/keisan.webp',
  './img/puzzle.png',
  './img/craft.png',
  './img/keisan.png',
  './img/chiba.webp',
  './img/chiba.png',
  './img/openchat_qr.png',
  './img/food.webp',
  './img/food.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
  './video/puzzle_tutorial.jpg',
  './video/craft_tutorial.jpg',
  './video/anzan_tutorial.jpg',
  './video/chiba_tutorial.jpg',
  './video/food_tutorial.jpg'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => (k.startsWith('korokoro-') || k.startsWith('kousen-')) && k !== CACHE && k !== FONT_CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Google Fonts（Klee One）: 一度読んだものを保存して、オフラインでも同じ文字で表示
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(FONT_CACHE).then(async c => {
      const hit = await c.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok || res.type === 'opaque') c.put(req, res.clone());
      return res;
    }));
    return;
  }

  if (url.origin !== location.origin) return;
  // 動画は途中から読み込む（Range）ため、Service Worker を通さずそのまま配信
  if (req.headers.has('range') || url.pathname.endsWith('.mp4')) return;

  // 同じサイト内: ネットにつながればネット優先、だめならキャッシュ
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || (req.mode === 'navigate' ? caches.match('./index.html') : undefined)))
  );
});
