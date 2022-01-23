const staticCacheName = 'pages-cache-v1'
const cacheTimeoutInMs = 600000
const headerVersionKey = 'version'
const dbBuildVersionKey = 'version'
const dbVersionUpdateTimeKey = 'versionTime'
const dbName = 'meta'
const dbStoreName = '11sense'
const isLogEnabled = true

let store
let idbRequest
let db

// self.addEventListener('push', event => {});

// self.addEventListener('install', event => {})

self.addEventListener('activate', event => {
    if (!self.indexedDB) {
        console.log('IndexedDB not supported');
        return
    }

    createDB()
})

self.addEventListener('fetch', function(event) {

    isLogEnabled && console.log('Incomming Request ', event.request.url);
    if (!event.request.url.startsWith(self.registration.scope)) {
        isLogEnabled && console.log('Network access (not in scope) ', event.request.url);
        event.respondWith(fetch(event.request)
            .then(response => {
                return response
            })
            .catch(() => {
                isLogEnabled && console.log('fetch external resource faild for ', event.request.url);
                var customResponse = { "status": 404, "statusText": "Offline" };
                return new Response(null, customResponse);
            }))
        return
    }

    let currentRequest = event.request
    if (event.request.url.endsWith('.js')) {
        // handle js module loads exceptional, because of the different request behavior,
        // witch can not be matched normally by the cache
        currentRequest = new Request(event.request.url, {
            mode: 'cors',
            credentials: 'omit'
        })
    }

    if (!self.indexedDB) {
        event.respondWith(sendRequest(currentRequest))
        return
    }

    event.respondWith(caches.match(currentRequest)
        .then(function(cachedResponse) {
            return getIdbRequestPromise(self.indexedDB.open(dbName, 1))
                .then(function(dbEvent) {

                    let db = dbEvent.target.result
                    db.onerror = (error) => {

                        // handle all db errors
                        console.log('db error:', error.target.errorCode)

                        return sendRequest(currentRequest)
                    }

                    return getIdbRequestPromise(db.transaction([dbStoreName]).objectStore(dbStoreName).get(0))
                        .then((event) => {
                            let version = event.target.result[dbBuildVersionKey]
                            let versionTime = event.target.result[dbVersionUpdateTimeKey]

                            if (!cachedResponse) {
                                // no cache)
                                return sendRequest(currentRequest)
                            }
                            if (cacheTimeoutInMs < Date.now() - versionTime) {
                                // old cache
                                isLogEnabled && console.log('Cache ignored for ', currentRequest.url, ' (to old, diff=', (Date.now() - versionTime), ')');
                                return sendRequest(currentRequest, cachedResponse)
                            }
                            if (!version || version == "") {
                                // the value for the latest cache version is not set in the db, so we need to ask
                                isLogEnabled && console.log('Cache ignored for ', currentRequest.url, ' (latest version unkown)');
                                return sendRequest(currentRequest, cachedResponse)
                            }

                            if (cachedResponse.headers.get('version') == version) {
                                isLogEnabled && console.log('Found in cache ', currentRequest.url, ' (right version "', version, '" and in time=', (Date.now() - versionTime), ')');
                                return cachedResponse
                            }

                            // cache outdated by version
                            return sendRequest(currentRequest, cachedResponse)
                        })
                        .catch(function(error) {
                            console.log('indexedDB read failed:', error)
                            return sendRequest(currentRequest)
                        })
                })
                .catch(function(error) {
                    console.log('indexedDB access failed:', error)
                    return sendRequest(currentRequest)
                })
        })
        .catch(function(error) {
            isLogEnabled && console.log('No cache entry found for ', currentRequest.url, 'error: ', error);
            return sendRequest(currentRequest)
        })
    )
})

// just wrap a database event into an promise
function getIdbRequestPromise(idbRequest, resolve = 'onsuccess', reject = 'onerror') {
    return new Promise(function(res, rej) {
        idbRequest[resolve] = res
        idbRequest[reject] = rej
    });
}

// only way to make a call into the internet
// also updates the cache
function sendRequest(request, fallbackResponse = false) {
    return fetch(request)
        .then(response => {
            if (self.indexedDB) {
                getIdbRequestPromise(self.indexedDB.open(dbName, 1))
                    .then(function(dbEvent) {
                        let db = dbEvent.target.result
                        db.onerror = (error) => {
                            // handle all db errors
                            console.log('db error:', error.target.error)
                            return response
                        }

                        let store = db.transaction([dbStoreName], 'readwrite').objectStore(dbStoreName);

                        store.put({ id: 0, [dbBuildVersionKey]: response.headers.get('version'), [dbVersionUpdateTimeKey]: Date.now() })
                    })
                    .catch(error => {
                        console.log('indexedDB access failed:', error)
                        return response
                    })
            }

            // Add fetched files to the cache
            return caches.open(staticCacheName).then(cache => {
                cache.put(request.url, response.clone())
                console.log('Network request success: ', request.url);
                return response
            })
        }).catch(response => {
            if (fallbackResponse) {
                console.log('Request failed, use cache');
                return fallbackResponse;
            }
            console.log("File offline and not in cache:" + response)
            return response
        })
}

// The database is used to store global caching information like the current page (build) version
// and the last time a service worker has seen a response from the server or tried to get one.
function createDB() {
    self.indexedDB.deleteDatabase(dbName)
    getIdbRequestPromise(self.indexedDB.open(dbName, 1), 'onupgradeneeded')
        .then(function(dbEvent) {
            let db = dbEvent.target.result
            let store = db.createObjectStore(dbStoreName, { keyPath: 'id' });
            // initiate value
            store.add({ id: 0, [dbBuildVersionKey]: "", [dbVersionUpdateTimeKey]: 0 });
        })
        .catch(function(error) {
            console.log("DB creation failed: ", error)
        })
}