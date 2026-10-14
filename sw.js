// 오프라인에서도 앱이 열리도록 앱 셸을 캐시한다.
// 파일을 고친 뒤에는 CACHE 이름의 숫자를 올려야 휴대폰에 새 버전이 반영된다.
const CACHE = 'gongil-attendance-v2';
const SHELL = [
  './',
  './index.html',
  './css/style.css',
  './js/roster.js',
  './js/store.js',
  './js/app.js',
  './assets/icon.svg',
  // 화면에 보이는 이미지만 미리 받는다. 공유 이미지·스플래시·큰 아이콘은 필요할 때 받는다.
  './assets/img/header-mascot.png',
  './assets/img/all-present.png',
  './assets/img/export-hero.png',
  './assets/img/stats-empty.png',
  './assets/img/empty-roster.png',
  './assets/img/icon-192.png',
  './manifest.webmanifest',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 같은 출처: 캐시를 먼저 보여 주고 뒤에서 새로 받아 둔다.
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const hit = await cache.match(e.request);
      const net = fetch(e.request)
        .then((res) => { if (res.ok) cache.put(e.request, res.clone()); return res; })
        .catch(() => hit);
      return hit || net;
    })
  );
});
