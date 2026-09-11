/* Production SW: fetch handler so Chromium treats the build as installable.
   Network-only on purpose — no Cache Storage, no last-seen board.
   Caching would keep a stale demo seed after VITE_DEMO_SEED=0. */
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return
  event.respondWith(fetch(event.request))
})
