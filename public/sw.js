/**
 * Service Worker - 오프라인 지원 및 캐싱 전략
 */

const CACHE_NAME = 'recipe-book-v2.0'
const STATIC_CACHE = 'static-v2.0'
const DYNAMIC_CACHE = 'dynamic-v2.0'
const API_CACHE = 'api-v2.0'

// 캐시할 정적 파일들
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg'
]

// 설치 이벤트 - 정적 파일 캐싱
self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching static files')
        return cache.addAll(STATIC_FILES)
      })
      .then(() => self.skipWaiting())
  )
})

// 활성화 이벤트 - 오래된 캐시 정리
self.addEventListener('activate', event => {
  console.log('[SW] Activating Service Worker...')
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME && name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== API_CACHE)
            .map(name => caches.delete(name))
        )
      })
      .then(() => self.clients.claim())
  )
})

// Fetch 이벤트 - 네트워크 요청 가로채기
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)
  
  // API 요청 처리
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request, API_CACHE))
    return
  }
  
  // 정적 파일 처리
  if (STATIC_FILES.includes(url.pathname)) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE))
    return
  }
  
  // JS, CSS 파일 처리
  if (request.destination === 'script' || request.destination === 'style') {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE))
    return
  }
  
  // 이미지 파일 처리
  if (request.destination === 'image') {
    event.respondWith(cacheFirstStrategy(request, DYNAMIC_CACHE))
    return
  }
  
  // 기타 요청 처리
  event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE))
})

// 캐시 우선 전략
async function cacheFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cachedResponse = await cache.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.error('[SW] Network request failed:', error)
    // 오프라인 페이지 반환
    if (request.destination === 'document') {
      return caches.match('/offline.html')
    }
    throw error
  }
}

// 네트워크 우선 전략
async function networkFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName)
  
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.log('[SW] Falling back to cache:', request.url)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // 오프라인 페이지 반환
    if (request.destination === 'document') {
      return caches.match('/offline.html')
    }
    
    throw error
  }
}

// 백그라운드 동기화
self.addEventListener('sync', event => {
  console.log('[SW] Background sync triggered')
  
  if (event.tag === 'sync-recipes') {
    event.waitUntil(syncRecipes())
  }
})

// 레시피 동기화
async function syncRecipes() {
  try {
    const cache = await caches.open('recipe-data')
    const requests = await cache.keys()
    
    const promises = requests.map(async request => {
      const response = await cache.match(request)
      if (response) {
        const data = await response.json()
        // 서버에 데이터 전송
        await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
      }
    })
    
    await Promise.all(promises)
    console.log('[SW] Recipes synced successfully')
  } catch (error) {
    console.error('[SW] Sync failed:', error)
  }
}

// 푸시 알림
self.addEventListener('push', event => {
  console.log('[SW] Push notification received')
  
  const options = {
    title: '레시피북 알림',
    body: event.data ? event.data.text() : '새로운 레시피가 추가되었습니다!',
    icon: '/icon.svg',
    badge: '/icon.svg',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '레시피 보기',
        icon: '/icon.svg'
      },
      {
        action: 'close',
        title: '닫기',
        icon: '/icon.svg'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('레시피북', options)
  )
})

// 알림 클릭 처리
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification clicked')
  
  event.notification.close()
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/recipes')
    )
  } else {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// 주기적 백그라운드 동기화
self.addEventListener('periodicsync', event => {
  if (event.tag === 'update-recipes') {
    event.waitUntil(updateRecipes())
  }
})

// 레시피 업데이트
async function updateRecipes() {
  try {
    const response = await fetch('/api/recipes/latest')
    const recipes = await response.json()
    
    const cache = await caches.open('recipe-data')
    await cache.put('/api/recipes', new Response(JSON.stringify(recipes)))
    
    // 새 레시피가 있으면 알림
    if (recipes.hasNew) {
      self.registration.showNotification('새로운 레시피', {
        body: '새로운 레시피가 추가되었습니다!',
        icon: '/icon.svg'
      })
    }
  } catch (error) {
    console.error('[SW] Update failed:', error)
  }
}

// 메시지 처리
self.addEventListener('message', event => {
  console.log('[SW] Message received:', event.data)
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data.type === 'CACHE_RECIPE') {
    cacheRecipe(event.data.recipe)
  }
})

// 개별 레시피 캐싱
async function cacheRecipe(recipe) {
  const cache = await caches.open('recipe-data')
  await cache.put(
    `/api/recipes/${recipe.id}`,
    new Response(JSON.stringify(recipe))
  )
}