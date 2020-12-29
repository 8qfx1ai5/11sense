const staticCacheName = 'pages-cache-v1'

self.addEventListener('install', event => {})

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

    event.respondWith(fetch(currentRequest)

        .then(response => {
            // Add fetched files to the cache
            return caches.open(staticCacheName).then(cache => {
                cache.put(event.request.url, response.clone())
                console.log('Network request success: ', event.request.url);
                return response
            })
        })
        .catch(error => {
            console.log("Offline: ", currentRequest.url, ' try to use cache')

            return caches.match(currentRequest)
                .then(cachedResponse => {
                    if (cachedResponse) {
                        console.log('Found ', currentRequest.url, ' in cache');
                        return cachedResponse;
                    }
                }).catch(error => {
                    console.log("File not in cache:" + currentRequest.url)
                        // TODO 6 - Respond with custom offline page
                })
        })
    )

})

// self.addEventListener('push', event => {
//     event.waitUntil(
//         self.registration.showNotification('Neuer Stadtführer verfügbar', {
//             body: 'Entdecken Sie die Schönheiten der Baustellenstadt Karlsruhe.',
//             icon: 'assets/launcher-icon-3x.png',
//             tag: 'notification'
//         })
//     );
// });