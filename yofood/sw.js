// Service Worker pour Yo Food - Émission Culinaire
const CACHE_NAME = "yo-food-v2.0.0";
const STATIC_CACHE = "static-cache-v2";
const DYNAMIC_CACHE = "dynamic-cache-v2";

// Assets à mettre en cache lors de l'installation
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/offline.html",
  "/assets/css/main.css",
  "/assets/js/main.js",
  "/assets/img/logo.jpg",
  "/assets/img/Rfissa.png",
  "/assets/img/nous.png",
  "/assets/img/shop1.jpg",
  "/assets/img/shop2.jpg",
  "/assets/img/shop3.jpg",
  "/assets/img/shop4.jpg",
  "/assets/img/gallery-1.jpg",
  "/assets/img/gallery-2.jpg",
  "/assets/img/gallery-3.jpg",
  "/assets/img/gallery-4.jpg",
  "/assets/img/gallery-5.jpg",
  "/assets/img/gallery-6.jpg",
  "/assets/img/testimonial-1.jpg",
  "/assets/img/testimonial-2.jpg",
  "/assets/img/testimonial-3.jpg",
  "/assets/videos/video1.mp4",
  "/assets/videos/video2.mp4",
  "/assets/videos/video4.mp4",
  "https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Poppins:wght@300;400;500;600;700&display=swap",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
  "https://fonts.gstatic.com/s/montserrat/v25/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCs16Hw5aX8.woff2",
  "https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrJJbecmNE.woff2",
];

// Installation du Service Worker
self.addEventListener("install", (event) => {
  console.log("🛠 Service Worker: Installation...");

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("📦 Mise en cache des assets statiques");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log("✅ Service Worker: Installation terminée");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("❌ Erreur lors de l'installation:", error);
      })
  );
});

// Activation du Service Worker
self.addEventListener("activate", (event) => {
  console.log("🚀 Service Worker: Activation...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Supprimer les anciens caches
            if (
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== CACHE_NAME
            ) {
              console.log("🗑 Suppression de l'ancien cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("✅ Service Worker: Activation terminée");
        return self.clients.claim();
      })
  );
});

// Stratégie de cache: Network First avec fallback au cache
self.addEventListener("fetch", (event) => {
  // Ignorer les requêtes non-GET et les requêtes chrome-extension
  if (
    event.request.method !== "GET" ||
    event.request.url.startsWith("chrome-extension://")
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la requête réussit, mettre à jour le cache
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Si le réseau échoue, chercher dans le cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // Si pas dans le cache et que c'est une page, retourner la page offline
          if (event.request.destination === "document") {
            return caches.match("/offline.html");
          }

          // Pour les images, retourner une image placeholder
          if (event.request.destination === "image") {
            return caches.match("/assets/img/placeholder.jpg");
          }

          return new Response("Ressource non disponible hors ligne", {
            status: 503,
            statusText: "Service Unavailable",
          });
        });
      })
  );
});

// Gestion des messages depuis l'application
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "GET_VERSION") {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Gestion des notifications push
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || "Nouvelle notification de Yo Food",
    icon: "/assets/icons/icon-192x192.png",
    badge: "/assets/icons/badge-72x72.png",
    image: data.image || "/assets/img/logo.jpg",
    vibrate: [200, 100, 200],
    data: {
      url: data.url || "/",
    },
    actions: [
      {
        action: "open",
        title: "Ouvrir",
      },
      {
        action: "close",
        title: "Fermer",
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "Yo Food", options)
  );
});

// Gestion des clics sur les notifications
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") {
    return;
  }

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Si une fenêtre Yo Food est déjà ouverte, on la focus
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            return client.focus();
          }
        }

        // Sinon on ouvre une nouvelle fenêtre
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url || "/");
        }
      })
  );
});

// Gestion de la synchronisation en arrière-plan
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    console.log("🔄 Synchronisation en arrière-plan");
    event.waitUntil(doBackgroundSync());
  }
});

// Fonction de synchronisation en arrière-plan
function doBackgroundSync() {
  return new Promise((resolve) => {
    // Ici vous pouvez ajouter la logique de synchronisation
    // Par exemple, synchroniser le panier, les favoris, etc.
    console.log("✅ Synchronisation terminée");
    resolve();
  });
}

// Gestion des mises à jour en arrière-plan
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "content-update") {
    event.waitUntil(updateContent());
  }
});

// Mise à jour périodique du contenu
function updateContent() {
  return fetch("/api/latest-content")
    .then((response) => response.json())
    .then((data) => {
      // Mettre à jour le cache avec le nouveau contenu
      return caches.open(DYNAMIC_CACHE).then((cache) => {
        // Logique de mise à jour du cache
        console.log("📰 Contenu mis à jour");
      });
    })
    .catch((error) => {
      console.error("Erreur mise à jour contenu:", error);
    });
}

// Gestion des erreurs globales
self.addEventListener("error", (event) => {
  console.error("🚨 Erreur Service Worker:", event.error);
});

// Gestion du rejet de promesses non catchées
self.addEventListener("unhandledrejection", (event) => {
  console.error("🚨 Rejet non géré:", event.reason);
});
