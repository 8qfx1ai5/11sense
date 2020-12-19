const staticCacheName = 'pages-cache-v1';

self.addEventListener('install', event => {});

self.addEventListener('fetch', function(event) {
    let currentRequest = event.request
    if (event.request.url.endsWith('.js')) {
        // handle js module loads exceptional, because of the different request behavior,
        // witch can not be matched normally by the cache
        currentRequest = new Request(event.request.url, {
            mode: 'cors',
            credentials: 'omit'
        })
    }

    event.respondWith(caches.match(currentRequest)
        .then(cachedResponse => {
            if (cachedResponse) {
                console.log('Found ', event.request.url, ' in cache');
                return cachedResponse;
            }
            console.log('Network request for ', event.request.url);
            return fetch(event.request)

            // Add fetched files to the cache
            .then(response => {
                // TODO 5 - Respond with custom 404 page
                return caches.open(staticCacheName).then(cache => {
                    cache.put(event.request.url, response.clone());
                    return response;
                });
            });

        }).catch(error => {

            console.log("file not in cache:" + event.request.url)
                // TODO 6 - Respond with custom offline page

        })
    );
});

// self.addEventListener('push', event => {
//     event.waitUntil(
//         self.registration.showNotification('Neuer Stadtführer verfügbar', {
//             body: 'Entdecken Sie die Schönheiten der Baustellenstadt Karlsruhe.',
//             icon: 'assets/launcher-icon-3x.png',
//             tag: 'notification'
//         })
//     );
// });