
const publicVapidKey = 'BCafw6fkkZll8BEesV3KjFjqpj7CtCgNDLpkUmPKmHxqPIt1GrYW5g6Xgr_BiGgkk5WlXDG-uUH31lhdqd4hJ1c'; // REPLACE_WITH_YOUR_KEY

// Register SW, Register Push, Send Push
async function send() {
    // Register Service Worker
    console.log('Registering service worker...');
    const register = await navigator.serviceWorker.register('./service-worker.js', {
        scope: '/',
    });
    console.log('Service Worker Registered...');

    // Register Push
    console.log('Registering Push...');
    const subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
    });
    console.log('Push Registered...');

    // Send Push Notification
    console.log('Sending Push...');
    await fetch('http://localhost:3002/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: {
            'content-type': 'application/json',
        },
    });
    console.log('Push Sent...');
}

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export async function register() {
    console.log('register');
    // Check for service worker
    if ('serviceWorker' in navigator) {
        send().catch((err) => console.error(err));
    }
    // if ('serviceWorker' in navigator) {
    //     console.log('serv');
    //     // The URL constructor is available in all browsers that support SW.
    //     const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    //     if (publicUrl.origin !== window.location.origin) {
    //         // Our service worker won't work if PUBLIC_URL is on a different origin
    //         // from what our page is served on. This might happen if a CDN is used to
    //         // serve assets; see https://github.com/facebook/create-react-app/issues/2374
    //         return;
    //     }

    //     window.addEventListener('load', () => {
    //         const swUrl = `/service-worker.js`;

    //         if (isLocalhost) {
    //             console.log('islog');
    //             // This is running on localhost. Let's check if a service worker still exists or not.
    //             checkValidServiceWorker(swUrl, config);

    //             // Add some additional logging to localhost, pointing developers to the
    //             // service worker/PWA documentation.
    //             navigator.serviceWorker.ready.then(() => {
    //                 console.log(
    //                     'This web app is being served cache-first by a service ' +
    //                         'worker. To learn more, visit https://cra.link/PWA'
    //                 );
    //             });
    //         } else {
    //             // Is not localhost. Just register service worker
    //             registerValidSW(swUrl, config);
    //         }
    //     });
    // }
}

// function registerValidSW(swUrl: string, config?: Config) {
//     navigator.serviceWorker
//         .register(swUrl)
//         .then((registration) => {
//             registration.pushManager.subscribe();
//             registration.onupdatefound = () => {
//                 const installingWorker = registration.installing;
//                 if (installingWorker == null) {
//                     return;
//                 }
//                 installingWorker.onstatechange = () => {
//                     if (installingWorker.state === 'installed') {
//                         if (navigator.serviceWorker.controller) {
//                             // At this point, the updated precached content has been fetched,
//                             // but the previous service worker will still serve the older
//                             // content until all client tabs are closed.
//                             console.log(
//                                 'New content is available and will be used when all ' +
//                                     'tabs for this page are closed. See https://cra.link/PWA.'
//                             );

//                             // Execute callback
//                             if (config && config.onUpdate) {
//                                 config.onUpdate(registration);
//                             }
//                         } else {
//                             // At this point, everything has been precached.
//                             // It's the perfect time to display a
//                             // "Content is cached for offline use." message.
//                             console.log('Content is cached for offline use.');

//                             // Execute callback
//                             if (config && config.onSuccess) {
//                                 config.onSuccess(registration);
//                             }
//                         }
//                     }
//                 };
//             };
//         })
//         .catch((error) => {
//             console.error('Error during service worker registration:', error);
//         });
// }

// function checkValidServiceWorker(swUrl: string, config?: Config) {
//     // Check if the service worker can be found. If it can't reload the page.
//     fetch(swUrl, {
//         headers: { 'Service-Worker': 'script' },
//     })
//         .then((response) => {
//             console.log('resposne: ', response);
//             // Ensure service worker exists, and that we really are getting a JS file.
//             const contentType = response.headers.get('content-type');
//             if (response.status === 404 || (contentType != null && contentType.indexOf('javascript') === -1)) {
//                 console.log('          // No service worker found. Probably a different app. Reload the page.');
//                 // No service worker found. Probably a different app. Reload the page.
//                 navigator.serviceWorker.ready.then((registration) => {
//                     registration.unregister().then(() => {
//                         window.location.reload();
//                     });
//                 });
//             } else {
//                 console.log('register valid');
//                 // Service worker found. Proceed as normal.
//                 registerValidSW(swUrl, config);
//             }
//         })
//         .catch(() => {
//             console.log('No internet connection found. App is running in offline mode.');
//         });
// }

export function unregister() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
            .then((registration) => {
                registration.unregister();
            })
            .catch((error) => {
                console.error(error.message);
            });
    }
}
