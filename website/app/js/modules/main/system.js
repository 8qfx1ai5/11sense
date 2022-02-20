let loggingMax = 99
let defaultLogLevel = 3
let logLevelLocalStorageKey = "logLevel"
let loggingLocalStorageKey = "debugLog"

let cachedLogLevel = false

let knownEvents = []

/*
    log level interpretation:

    If you set this in the code during the log call:
    1. it is logged only in verbose
    2. it is logged in default or more
    3. it is logged in every case, if log is not totally disabled
    4. this log can not be disabled

    If you select this log level in the config
    1. VERBOSE: log absolutely everything, independently of the selected log level
    2. DEFAULT: default (most useful steps)
    3. ERROR: only verry important things
    4. OFF: do not log anything
*/
export function log(s, l = 3, onlySingleLog = false) {
    if (getSelectedLogLevel() <= l) {
        // TODO: switch by objects like error and do intelligent stuff
        switch (onlySingleLog) {
            case "console":
                console.log(s);
                break;
            case "app":
                saveLogInLocalStorage(s);
                break;
            default:
                console.log(s);
                saveLogInLocalStorage(s);
                break;
        }
    }
}

export function getLoggingsFromLocalStorage() {
    let oldLoggings = localStorage.getItem(loggingLocalStorageKey);
    if (!oldLoggings) {
        oldLoggings = [];
    } else {
        try {
            oldLoggings = JSON.parse(oldLoggings)
        } catch (e) {
            oldLoggings = [];
        }
    }
    return oldLoggings;
}

function saveLogInLocalStorage(s) {
    let oldLoggings = getLoggingsFromLocalStorage();
    if (loggingMax < oldLoggings.length) {
        oldLoggings.splice(0, oldLoggings.length - loggingMax);
    }
    let logEntry = new Date().toLocaleString() + ": " + s
    oldLoggings.push(logEntry);
    localStorage.setItem(loggingLocalStorageKey, JSON.stringify(oldLoggings));
    window.dispatchEvent(new CustomEvent('custom-log-changed', { detail: { log: logEntry } }))
}

function getSelectedLogLevel() {
    if (cachedLogLevel) {
        return cachedLogLevel
    }
    let storedLogLevel = localStorage.getItem(logLevelLocalStorageKey)
    if (storedLogLevel && storedLogLevel != "") {
        cachedLogLevel = parseInt(storedLogLevel, 10)
        return cachedLogLevel
    }
    cachedLogLevel = defaultLogLevel
    localStorage.setItem(logLevelLocalStorageKey, defaultLogLevel)
    return defaultLogLevel
}

function wrapWindowMethodAddEventListender(wrapperFunction) {
    let originalFunction = window["addEventListener"]

    return window["addEventListener"] = function() {
        return wrapperFunction.apply(
            this, [originalFunction.bind(this)].concat(Array.prototype.slice.call(arguments))
        )
    }
}

export function init() {

    wrapWindowMethodAddEventListender(function(originalFunction) {
        // this is a hack to omit a custom event bus
        let originalParams = Array.prototype.slice.call(arguments, 1)

        // this is my injected code to track and log custom events on window
        if (!knownEvents.includes(originalParams[0])) {
            knownEvents.push(originalParams[0])
            window.addEventListener(originalParams[0], (e) => {
                if (e instanceof CustomEvent) {
                    if (e.type == 'logLevel-changed') {
                        cachedLogLevel = false
                    }
                    if (e.type != 'custom-log-changed') {
                        log(e, 2, "console")
                        log(e.constructor.name.toUpperCase() + ": " + e.type, 2, "app")
                    }
                }
            })
        }
        originalFunction.apply(undefined, originalParams)
    })

    // log all errors
    window.onerror = function(errorMsg, url, lineNumber, column, errorObj) {
        log('ERR: ' + errorMsg +
            ' URL: ' + url +
            ' LINE: ' + lineNumber +
            ' COLUMN: ' + column +
            ' STACKTRACE: ' + errorObj, 3, "app");
    };

    document.addEventListener("securitypolicyviolation", (e) => {
        log('SEC-ERR: ' + e.violatedDirective +
            ' URL: ' + e.blockedURI +
            ' POLICY: ' + e.originalPolicy
        );
    });

    window.addEventListener("load", () => {
        // install service worker
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register('service-worker.js', {
                    updateViaCache: 'none',
                })
                .then(registration => {
                    registration.addEventListener('updatefound', function() {
                        // If updatefound is fired, it means that there's
                        // a new service worker being installed.
                        let installingWorker = registration.installing
                        log('New service worker successfully registered for scope ' + registration.scope, 3, 'app')
                        log('New service worker successfully registered for scope ' + registration.scope + ' ' + installingWorker, 3, 'console')

                        // You can listen for changes to the installing service worker's
                        // state via installingWorker.onstatechange
                    })
                })
                .catch(err => log('Service worker registration failed: ' + err, 3))
        }
    })
}