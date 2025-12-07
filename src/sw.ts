/// <reference lib="webworker" />
// VitePWA injectManifest 기반 서비스 워커
import { precacheAndRoute } from 'workbox-precaching'

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: any }

const CACHE_NAME = 'recipe-book-v2.0'
const STATIC_CACHE = 'static-v2.0'
const DYNAMIC_CACHE = 'dynamic-v2.0'
const API_CACHE = 'api-v2.0'

const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg'
]

// Workbox가 빌드 시 주입하는 프리캐시 매니페스트
precacheAndRoute(self.__WB_MANIFEST)

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_FILES))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(
      names
        .filter((n) => ![CACHE_NAME, STATIC_CACHE, DYNAMIC_CACHE, API_CACHE].includes(n))
        .map((n) => caches.delete(n))
    )).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event
  const url = new URL(request.url)

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, API_CACHE))
    return
  }
  if (STATIC_FILES.includes(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }
  if (request.destination === 'script' || request.destination === 'style') {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }
  if (request.destination === 'image') {
    event.respondWith(cacheFirst(request, DYNAMIC_CACHE))
    return
  }
  event.respondWith(networkFirst(request, DYNAMIC_CACHE))
})

async function cacheFirst(request: Request, cacheName: string) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  if (cached) return cached
  try {
    const resp = await fetch(request)
    if (resp.ok) cache.put(request, resp.clone())
    return resp
  } catch (e) {
    if ((request as any).destination === 'document') {
      return caches.match('/offline.html') as Promise<Response>
    }
    throw e
  }
}

async function networkFirst(request: Request, cacheName: string) {
  const cache = await caches.open(cacheName)
  try {
    const resp = await fetch(request)
    if (resp.ok) cache.put(request, resp.clone())
    return resp
  } catch (e) {
    const cached = await cache.match(request)
    if (cached) return cached
    if ((request as any).destination === 'document') {
      return caches.match('/offline.html') as Promise<Response>
    }
    throw e
  }
}

self.addEventListener('sync', (event: any) => {
  if (event.tag === 'sync-recipes') {
    event.waitUntil(syncRecipes())
  }
})

async function syncRecipes() {
  try {
    const cache = await caches.open('recipe-data')
    const requests = await cache.keys()
    await Promise.all(requests.map(async (req) => {
      const res = await cache.match(req)
      if (res) {
        const data = await res.json()
        await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
      }
    }))
  } catch (e) {
    // no-op
  }
}

self.addEventListener('push', (event: any) => {
  const options: NotificationOptions = {
    body: event.data ? event.data.text() : '새로운 레시피가 추가되었습니다!',
    icon: '/icon.svg',
    badge: '/icon.svg',
    vibrate: [200, 100, 200]
  }
  event.waitUntil(self.registration.showNotification('레시피북', options))
})

self.addEventListener('notificationclick', (event: any) => {
  event.notification.close()
  const path = event.action === 'explore' ? '/recipes' : '/'
  event.waitUntil(self.clients.openWindow(path))
})

self.addEventListener('message', (event: any) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

