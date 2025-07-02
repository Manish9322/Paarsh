// Import Workbox PWA logic
importScripts("https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js");

if (workbox) {
  console.log("✅ Workbox is loaded");

  // Cache assets
  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

  // Cache page navigations
  workbox.routing.registerRoute(
    ({ request }) => request.mode === "navigate",
    new workbox.strategies.NetworkFirst({
      cacheName: "pages",
    })
  );

  // Cache CSS, JS, and Web Workers
  workbox.routing.registerRoute(
    ({ request }) =>
      request.destination === "style" ||
      request.destination === "script" ||
      request.destination === "worker",
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: "assets",
    })
  );

  // Cache images
  workbox.routing.registerRoute(
    ({ request }) => request.destination === "image",
    new workbox.strategies.CacheFirst({
      cacheName: "images",
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 Days
        }),
      ],
    })
  );
} else {
  console.error("❌ Workbox failed to load");
}

// ✅ Push Notification Handling
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();

    const options = {
      body: data.body,
      icon: "/192x192.png",
      badge: "/72x72.png",
      tag: data.tag || "notification",
      data: {
        url: data.url || "/",
        notificationId: data.notificationId,
      },
      actions: [
        {
          action: "view",
          title: "View",
          icon: "/icon-view.png",
        },
        {
          action: "close",
          title: "Close",
          icon: "/icon-close.png",
        },
      ],
      requireInteraction: true,
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  if (event.action === "view" || !event.action) {
    const url = event.notification.data.url || "/";
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientList) => {
        for (let client of clientList) {
          if (client.url === url && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
});

self.addEventListener("notificationclose", function (event) {
  console.log("Notification closed:", event.notification.tag);
});
