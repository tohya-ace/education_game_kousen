// 知育Webアプリ KouSen式 Service Worker
// ファイルを更新したら VERSION を上げてください（古いキャッシュが入れ替わります）
const VERSION = 'v59';
const CACHE = 'kousen-' + VERSION;
const FONT_CACHE = 'kousen-fonts';
const ASSETS = [
  './',
  './index.html',
  './korokoro_puzzle.html',
  './korokoro_craft.html',
  './anzan_timeattack.html',
  './kuku_master.html',
  './kanji_ou.html',
  './eitango_master.html',
  './flash_kanji.html',
  './flash_eitango.html',
  './color_timeattack.html',
  './kazu_touch.html',
  './block_puzzle.html',
  './pair_tsukuru.html',
  './cat_pre.html',
  './cat_1.html',
  './cat_2.html',
  './cat_3.html',
  './cat_4.html',
  './cat_5.html',
  './cat_6.html',
  './cat_brain.html',
  './kotoba_search.html',
  './donut_connect.html',
  './quiz_runner.html',
  './nurie.html',
  './number_place.html',
  './block_maze.html',
  './flash_aiueo.html',
  './flash_aiueo_kata.html',
  './aiueo_touch.html',
  './aiueo_kata_touch.html',
  './abc_touch.html',
  './yamakawa_timeattack.html',
  './chiba_puzzle.html',
  './japan_puzzle.html',
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
  './img/japan.webp',
  './img/japan.png',
  './img/yamakawa.webp',
  './img/yamakawa.png',
  './img/kuku.webp',
  './img/kuku.png',
  './img/kanji.webp',
  './img/kanji.png',
  './img/eitango.webp',
  './img/eitango.png',
  './img/flashk.webp',
  './img/flashk.png',
  './img/flashe.webp',
  './img/flashe.png',
  './img/color.webp',
  './img/color.png',
  './img/block.webp',
  './img/block.png',
  './img/pair.webp',
  './img/pair.png',
  './img/kotoba.webp',
  './img/kotoba.png',
  './img/donut.webp',
  './img/donut.png',
  './img/quizrun.webp',
  './img/quizrun.png',
  './img/nurie.webp',
  './img/nurie.png',
  './img/numpl.webp',
  './img/numpl.png',
  './img/maze.webp',
  './img/maze.png',
  './img/flashhira.webp',
  './img/flashhira.png',
  './img/flashkata.webp',
  './img/flashkata.png',
  './img/kazutouch.webp',
  './img/kazutouch.png',
  './img/aiueotouch.webp',
  './img/aiueotouch.png',
  './img/aiueokatatouch.webp',
  './img/aiueokatatouch.png',
  './img/abctouch.webp',
  './img/abctouch.png',
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
  './video/jp_tutorial.jpg',
  './video/yamakawa_tutorial.jpg',
  './video/kuku_tutorial.jpg',
  './video/kanji_tutorial.jpg',
  './video/eitango_tutorial.jpg',
  './video/flashk_tutorial.jpg',
  './video/flashe_tutorial.jpg',
  './video/color_tutorial.jpg',
  './video/kazu_tutorial.jpg',
  './video/block_tutorial.jpg',
  './video/pair_tutorial.jpg',
  './video/kotoba_tutorial.jpg',
  './video/donut_tutorial.jpg',
  './video/quiz_tutorial.jpg',
  './video/nurie_tutorial.jpg',
  './video/numpl_tutorial.jpg',
  './video/maze_tutorial.jpg',
  './video/flashhira_tutorial.jpg',
  './video/flashkata_tutorial.jpg',
  './video/aiueo_tutorial.jpg',
  './video/aiueokata_tutorial.jpg',
  './video/abc_tutorial.jpg',
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
