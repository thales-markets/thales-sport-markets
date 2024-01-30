// _____SERVICE_____WORKER____
self.addEventListener('install', function (event) {
    console.log('[Service Worker] Installing Service Worker ...', event);
    self.skipWaiting();
});

self.addEventListener('activate', function (event) {
    console.log('[Service Worker] Activating Service Worker ...', event);
    self.clients.claim();
});

self.addEventListener('push', (event) => {
    const options = {
        body: event.data.text(),
        icon: 'maskable-icon.png', // Replace with your icon path
    };
    event.waitUntil(self.registration.showNotification('OvertimeAPP', options));
});
