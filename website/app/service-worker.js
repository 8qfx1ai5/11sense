const staticCacheName = 'pages-cache-v1'
const cacheTimeoutInMs = 5000

let version = ""

let versionTime = 0

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

    event.respondWith(caches.match(currentRequest)
        .then(cachedResponse => {
            if (cachedResponse && performance.now() - versionTime < cacheTimeoutInMs && cachedResponse.headers.version == version) {
                console.log('Found in cache ', currentRequest.url, ' (right version and in time)');
                return cachedResponse;
            }
            // wrong version or outdated cache
            return sendRequest(currentRequest)
        }).catch(error => {
            // not in cache
            return sendRequest(currentRequest)
        }))
})

function sendRequest(request) {
    return fetch(request)
        .then(response => {
            versionTime = performance.now()
            version = response.headers.version

            // Add fetched files to the cache
            return caches.open(staticCacheName).then(cache => {
                cache.put(request.url, response.clone())
                console.log('Network request success: ', request.url);
                return response
            })
        }).catch(error => {
            console.log("Offline: ", request.url, ' try to use cache')

            return caches.match(request)
                .then(cachedResponse => {
                    if (cachedResponse) {
                        console.log('Found in cache (offline)', currentRequest.url);
                        return cachedResponse;
                    }
                }).catch(error => {
                    console.log("File offline and not in cache:" + error.url)

                    // TODO 6 - Respond with custom offline page
                })
        })
}

// self.addEventListener('push', event => {
//     event.waitUntil(
//         self.registration.showNotification('Neuer Stadtführer verfügbar', {
//             body: 'Entdecken Sie die Schönheiten der Baustellenstadt Karlsruhe.',
//             icon: 'assets/launcher-icon-3x.png',
//             tag: 'notification'
//         })
//     );
// });