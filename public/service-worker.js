self.addEventListener('install', function (event) {
    console.log('[Service Worker] Installing Service Worker ...', event);
    self.skipWaiting();
});

self.addEventListener('activate', function (event) {
    console.log('[Service Worker] Activating Service Worker ...', event);
    self.clients.claim();
});

// service-worker.js
self.addEventListener('push', (event) => {
    const options = {
        body: event.data.text(),
        icon: 'favicon-32x32.png', // Replace with your icon path
    };
    event.waitUntil(self.registration.showNotification('OvertimeAPP', options));
});

// setInterval(() => {
//     displayNotification();
// }, [2000]);

// async function displayNotification() {
//     console.log('hello');
//     self.clients.claim();
//     if ('serviceWorker' in self) {
//         console.log('jes');
//         const options = {
//             body: 'Success',
//         };
//         self.serviceWorker.ready.then((swreg) => {
//             console.log('show notifications');
//             swreg.showNotification(options);
//         });
//     } else {
//         console.log('service worker not ready');
//     }
// }
