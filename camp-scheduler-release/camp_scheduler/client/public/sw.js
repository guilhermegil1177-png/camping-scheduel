const CACHE_NAME = 'camp-scheduler-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE).catch(() => {
        // Falha silenciosa se algum recurso não estiver disponível
      });
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response
        const responseClone = response.clone();
        
        // Cache successful responses
        if (response.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        
        return response;
      })
      .catch(() => {
        // Return cached response if network fails
        return caches.match(event.request).then((response) => {
          return response || new Response('Offline - recurso não disponível', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      })
  );
});

// Background sync for notifications (quando online)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications());
  }
});

async function syncNotifications() {
  try {
    const db = await openDatabase();
    const notifications = await getAllNotifications(db);
    
    for (const notification of notifications) {
      if (!notification.sent && notification.time <= Date.now()) {
        await self.registration.showNotification(notification.title, {
          body: notification.body,
          icon: '/manus-storage/camp-logo_318861f1.png',
          badge: '/manus-storage/camp-logo_318861f1.png',
          tag: notification.id,
          requireInteraction: true,
          data: {
            url: '/',
            dayId: notification.dayId
          }
        });
        
        // Mark as sent
        await markNotificationAsSent(db, notification.id);
      }
    }
  } catch (error) {
    console.error('Erro ao sincronizar notificações:', error);
  }
}

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Se a janela já está aberta, foca nela
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // Senão, abre uma nova janela
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// IndexedDB helpers
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('CampSchedulerDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('notifications')) {
        db.createObjectStore('notifications', { keyPath: 'id' });
      }
    };
  });
}

function getAllNotifications(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('notifications', 'readonly');
    const store = transaction.objectStore('notifications');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function markNotificationAsSent(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('notifications', 'readwrite');
    const store = transaction.objectStore('notifications');
    const getRequest = store.get(id);
    
    getRequest.onsuccess = () => {
      const notification = getRequest.result;
      notification.sent = true;
      const updateRequest = store.put(notification);
      updateRequest.onerror = () => reject(updateRequest.error);
      updateRequest.onsuccess = () => resolve();
    };
    
    getRequest.onerror = () => reject(getRequest.error);
  });
}
