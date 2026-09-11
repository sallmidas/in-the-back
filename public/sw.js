/* Minimal fetch handler so Chromium treats the web build as installable.
   Network-only — do not cache, so seed-on vs seed-off builds cannot go stale. */
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
