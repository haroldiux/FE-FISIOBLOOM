// "Kill switch": este proyecto nunca usa Service Worker propio. Este archivo existe
// solo para reemplazar y eliminar cualquier Service Worker de OTRO proyecto que haya
// quedado registrado en este mismo origen (localhost:3000), que puede quedar sirviendo
// una versión vieja/rota de la app incluso después de refrescar o abrir pestaña nueva.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.registration.unregister(),
      caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key)))),
    ]).then(() => self.clients.matchAll({ type: 'window' }))
      .then((clients) => {
        clients.forEach((client) => client.navigate(client.url));
      })
  );
});
