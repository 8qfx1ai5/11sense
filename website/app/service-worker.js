const staticCacheName = 'pages-cache-v1'
const cacheTimeoutInMs = 10000
const headerVersionKey = 'version'
const dbBuildVersionKey = 'version'
const dbVersionUpdateTimeKey = 'versionTime'
const dbName = 'meta'
const dbStoreName = '11sense'

let version = ""
let versionTime = 0
let store
let idbRequest
let db

// self.addEventListener('push', event => {});

// self.addEventListener('install', event => {})

self.addEventListener('activate', function(event) {
    if (!self.indexedDB) {
        console.log('IndexedDB not supported');
        return
    }

    event.waitUntil(
        createDB()
    )
})

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
                if (self.indexedDB) {
                    idbRequest = self.indexedDB.open(dbName, 1);
                    idbRequest.onsuccess = function(dbEvent) {
                        let db = dbEvent.target.result
                        let tx = db.transaction([dbStoreName], 'readonly');
                        let store = tx.objectStore(dbStoreName);
                        // TODO: here is a bug, wait until data returned
                        version = store.get(dbBuildVersionKey);
                        versionTime = store.get(dbVersionUpdateTimeKey);

                        console.log('now:', performance.now(), ' versionTime:', versionTime, ' diff:', performance.now() - versionTime)
                        if (cachedResponse && performance.now() - versionTime < cacheTimeoutInMs && cachedResponse.headers.version == version) {
                            console.log('version:', version, ' cachedVersion:', cachedResponse.headers.version)
                            console.log('Found in cache ', currentRequest.url, ' (right version and in time)');
                            return cachedResponse;
                        }

                        // cache outdated
                        return sendRequest(event)
                    }
                    idbRequest.onerror = function(error) {
                        console.log('indexedDB access failed:', error)
                        return sendRequest(event)
                    }
                } else {
                    // IndexedDB is not supported
                    return sendRequest(event)
                }
            }
            // wrong version or outdated cache
            return sendRequest(currentRequest)
        }).catch(error => {
            // not in cache
            return sendRequest(currentRequest)
        })
    )
})

function sendRequest(request) {
    return fetch(request)
        .then(response => {
            store.put({ key: dbBuildVersionKey, value: response.headers.version })
            store.put({ key: dbVersionUpdateTimeKey, value: performance.now() })

            // Add fetched files to the cache
            return caches.open(staticCacheName).then(cache => {
                cache.put(request.url, response.clone())
                console.log('Network request success: ', request.url);
                return response
            })
        }).catch(error => {

            return caches.match(request, { ignoreSearch: true })
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

function createDB() {
    idbRequest = self.indexedDB.open(dbName, 1);
    idbRequest.onsuccess = function(event) {}
    idbRequest.onupgradeneeded = function(event) {
        let db = event.target.result
        let store = db.createObjectStore(dbStoreName, {
            keyPath: 'key'
        });
        store.createIndex("value", "value", { unique: false });
        // initiate values
        store.put({ key: dbBuildVersionKey, value: "" });
        store.put({ key: dbVersionUpdateTimeKey, value: 0 });
    };
    idbRequest.onerror = function(error) {
        console.log("DB creation failed: ", error)
    }
}