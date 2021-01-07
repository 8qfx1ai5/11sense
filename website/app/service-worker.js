const staticCacheName = 'pages-cache-v1'
const cacheTimeoutInMs = 10000
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
        event.respondWith(fetch(event.request))
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

    let cachedResponse = caches.match(currentRequest)

    if (!cachedResponse) {
        event.respondWith(sendRequest(currentRequest))
        return
    }

    if (!self.indexedDB) {
        event.respondWith(sendRequest(currentRequest))
        return
    }

    event.respondWith(getIdbRequestPromise(self.indexedDB.open(dbName, 1))
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

                    isLogEnabled && console.log('now:', Date.now(), ' versionTime:', versionTime, ' diff:', (Date.now() - versionTime))
                    if (!cachedResponse) {
                        // no cache)
                        return sendRequest(currentRequest)
                    }
                    if (cacheTimeoutInMs < Date.now() - versionTime) {
                        // old cache
                        return sendRequest(currentRequest)
                    }
                    if (!version || version == "") {
                        console.log('Found in cache ', currentRequest.url, ' (in time, version ignored)');
                        return cachedResponse
                    }

                    if (!("version" in cachedResponse.headers)) {
                        // wrong version, because not set
                        return sendRequest(currentRequest)
                    }

                    if (cachedResponse.headers.version == version) {
                        isLogEnabled && console.log('version:', version, ' cachedVersion:', cachedResponse.headers.version)
                        console.log('Found in cache ', currentRequest.url, ' (right version and in time)');
                        return cachedResponse

                    }

                    // cache outdated by version
                    return sendRequest(currentRequest)
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
    )
})

function getIdbRequestPromise(idbRequest, resolve = 'onsuccess', reject = 'onerror') {
    return new Promise(function(res, rej) {
        idbRequest[resolve] = res
        idbRequest[reject] = rej
    });
}

function sendRequest(request) {
    return fetch(request)
        .then(response => {
            if (self.indexedDB) {
                getIdbRequestPromise(self.indexedDB.open(dbName, 1))
                    .then(function(dbEvent) {
                        let db = dbEvent.target.result
                        db.onerror = (error) => {
                            // handle all db errors
                            console.log('db error:', error.target.error)
                            return
                        }

                        let store = db.transaction([dbStoreName], 'readwrite').objectStore(dbStoreName);

                        store.put({ id: 0, [dbBuildVersionKey]: response.headers.version, [dbVersionUpdateTimeKey]: Date.now() })
                    })
                    .catch(error => {
                        console.log('indexedDB access failed:', error)
                    })
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
                })
        })
}

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