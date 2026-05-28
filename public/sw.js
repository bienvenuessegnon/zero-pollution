// Zéro Pollution Bénin - Custom PWA Service Worker for Mobile Optimization
const CACHE_VERSION = 'v1.1';
const STATIC_CACHE_NAME = `static-assets-${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `dynamic-cache-${CACHE_VERSION}`;
const FONT_CACHE_NAME = 'google-fonts-cache';
const IMAGE_CACHE_NAME = 'reported-images-cache';
const MAP_TILE_CACHE_NAME = 'map-tiles-cache';

// Assets to pre-cache immediately on service worker installation
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo_pwa.png',
];

// Self installment
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching Core Shell');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Cache cleanup on activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName.startsWith('static-assets-') && cacheName !== STATIC_CACHE_NAME ||
            cacheName.startsWith('dynamic-cache-') && cacheName !== DYNAMIC_CACHE_NAME
          ) {
            console.log('[Service Worker] Removing legacy cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Helper to determine if a URL represents a static local bundle file
function isStaticLocalFile(url) {
  const path = url.pathname;
  return (
    path.endsWith('.js') ||
    path.endsWith('.css') ||
    path.includes('/assets/') ||
    path.endsWith('.woff') ||
    path.endsWith('.woff2') ||
    path.endsWith('.ttf')
  );
}

// Intercept requests and apply caching strategies optimised for low-bandwidth cellular environments
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // We only intercept GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip Firebase Firestore/Auth websocket and POST calls
  if (url.hostname.includes('googleapis.com') && (url.pathname.includes('/google.firestore') || url.pathname.includes('/identitytoolkit'))) {
    return;
  }

  // 1. Google Fonts Caching (Cache First)
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(FONT_CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return fetch(request).then((networkResponse) => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // 2. Leaflet Map Tiles Caching (Cache First with Fallback)
  if (url.hostname.includes('basemaps.cartocdn.com') || url.hostname.includes('tile.openstreetmap.org')) {
    event.respondWith(
      caches.open(MAP_TILE_CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return fetch(request)
            .then((networkResponse) => {
              // Cache map tile successfully
              cache.put(request, networkResponse.clone());
              return networkResponse;
            })
            .catch(() => {
              // Return a fallback or silent empty response if completely offline
              return new Response('', { status: 404 });
            });
        });
      })
    );
    return;
  }

  // 3. User Uploaded and Unsplash Sample Images (Stale-While-Revalidate / Cache First fallback)
  if (
    url.hostname.includes('images.unsplash.com') || 
    url.hostname.includes('firebasestorage.googleapis.com') ||
    url.pathname.endsWith('.png') || 
    url.pathname.endsWith('.jpg') || 
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.webp')
  ) {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => null);

          // Return cached image immediately, background fetch will update if needed,
          // otherwise returns the online request
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // 4. Local static bundle assets (Stale-While-Revalidate)
  if (isStaticLocalFile(url) || PRECACHE_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => null);

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // 5. General navigation or dynamic pages (Network First with Cache Fallback for offline usage)
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        // If it is valid, let's cache text/html responses in dynamic cache so they work offline
        if (networkResponse.status === 200 && request.headers.get('accept')?.includes('text/html')) {
          const cacheResponseClone = networkResponse.clone();
          caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            cache.put(request, cacheResponseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache if internet fails
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If we are looking for the root document and are offline
          if (request.mode === 'navigate') {
            return caches.match('/');
          }
          return new Response('Connexion instable ou inexistante. Cette ressource sera disponible dès le retour du réseau.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        });
      })
  );
});
