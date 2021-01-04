const staticCacheName = 'pages-cache-v1'
const cacheTimeoutInMs = 1000000
const headerVersionKey = 'version'
const dbBuildVersionKey = 'version'
const dbVersionUpdateTimeKey = 'versionTime'
const dbName = 'meta'
const dbStoreName = '11sense'
const isLoggingEnabled = true

let version = ""
let versionTime = 0
let store
let idbRequest
let db
let response = false

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
                        db.onerror = (error) => {
                            // handle all db errors
                            console.log('db error:', error.target.errorCode)
                            return sendRequest(currentRequest)
                        }

                        let store = db.transaction([dbStoreName]).objectStore(dbStoreName);

                        // TODO: here is a bug, wait until data returned
                        store.get(dbBuildVersionKey).onsuccess = (event) => {
                            version = event.target.result.value
                        }
                        store.get(dbVersionUpdateTimeKey).onsuccess = (event) => {
                            versionTime = event.target.result.value
                        }

                        isLoggingEnabled && console.log('now:', Date.now(), ' versionTime:', versionTime, ' diff:', Date.now() - versionTime)
                        if (cachedResponse && Date.now() - versionTime < cacheTimeoutInMs && cachedResponse.headers.version == version) {
                            isLoggingEnabled && console.log('version:', version, ' cachedVersion:', cachedResponse.headers.version)
                            console.log('Found in cache ', currentRequest.url, ' (right version and in time)');
                            response = cachedResponse;
                            return
                        }

                        // cache outdated
                        return sendRequest(currentRequest)
                    }
                    idbRequest.onerror = function(error) {
                        console.log('indexedDB access failed:', error)
                        return sendRequest(currentRequest)
                    }
                    if (response) {
                        return response
                    }
                    return sendRequest(currentRequest)
                } else {
                    // IndexedDB is not supported
                    // TODO: find alternative caching
                    return sendRequest(currentRequest)
                }
            } else {
                // there is no cache
                return sendRequest(currentRequest)
            }
        }).catch(error => {
            // not in cache
            return sendRequest(currentRequest)
        })
    )
})

function sendRequest(request) {
    return fetch(request)
        .then(response => {
            if (self.indexedDB) {
                idbRequest = self.indexedDB.open(dbName, 1);
                idbRequest.onsuccess = function(dbEvent) {
                    let db = dbEvent.target.result
                    db.onerror = (error) => {
                        // handle all db errors
                        console.log('db error:', error.target.error)
                        return
                    }

                    let store = db.transaction([dbStoreName], 'readwrite').objectStore(dbStoreName);

                    store.put({ key: dbBuildVersionKey, value: response.headers.version })
                    store.put({ key: dbVersionUpdateTimeKey, value: Date.now() })
                }
                idbRequest.onerror = function(error) {
                    console.log('indexedDB access failed:', error)
                }
            }

            // Add fetched files to the cache
            return caches.open(staticCacheName).then(cache => {
                cache.put(request.url, response.clone())
                console.log('Network request success: ', request.url);
                return response
            })
        }).catch(() => {

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
        // initiate value
        store.add({ key: dbBuildVersionKey, value: "" });
        store.add({ key: dbVersionUpdateTimeKey, value: 0 });
    };
    idbRequest.onerror = function(error) {
        console.log("DB creation failed: ", error)
    }
}