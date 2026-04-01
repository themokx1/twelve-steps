const CACHE_NAME = "aca-twelve-steps-v1";
const APP_SHELL = ["/manifest.webmanifest", "/icon.svg", "/apple-icon.svg"];
const STATIC_DESTINATIONS = new Set(["script", "style", "image", "font"]);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(
      fetch(request).catch(
        async () =>
          new Response("Offline mode does not serve personalized pages from cache.", {
            status: 503,
            headers: {
              "content-type": "text/plain; charset=utf-8"
            }
          })
      )
    );
    return;
  }

  if (!STATIC_DESTINATIONS.has(request.destination)) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const networkResponse = fetch(request)
        .then((response) => {
          if (response.ok) {
            const cloned = response.clone();
            event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned)));
          }

          return response;
        })
        .catch(async () => cachedResponse || Response.error());

      return cachedResponse ?? networkResponse;
    })
  );
});

self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};

  event.waitUntil(
    self.registration.showNotification(data.title || "ACA társ", {
      body: data.body || "Megérdemled, hogy jó történjen veled. Gyere vissza a mai lépésedhez.",
      icon: "/icon.svg",
      badge: "/icon.svg",
      data: {
        url: data.url || "/"
      }
    })
  );
});


self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }

      return undefined;
    })
  );
});
