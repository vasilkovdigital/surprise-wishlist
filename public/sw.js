// Офлайн: оболочка и данные — network-first с откатом на кэш; картинки (в т.ч. surprise.by) — cache-first.
const CACHE = 'wl-v1'

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./', 'data/products.json', 'data/meta.json'])).then(() => self.skipWaiting()))
})
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()))
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  const isImage = req.destination === 'image'
  if (isImage) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok || res.type === 'opaque') caches.open(CACHE).then((c) => c.put(req, res.clone()))
        return res
      }).catch(() => hit)),
    )
    return
  }
  if (url.origin !== location.origin) return
  e.respondWith(
    fetch(req).then((res) => {
      caches.open(CACHE).then((c) => c.put(req, res.clone()))
      return res
    }).catch(() => caches.match(req).then((hit) => hit || caches.match('./'))),
  )
})
