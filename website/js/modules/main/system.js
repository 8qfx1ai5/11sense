export let isLoggingMode = false;
let loggingMax = 99;
let logLevel = 1;
let loggingLocalStorageKey = "debugLog";

/*
    log levels:
    1. log absolutely everything
    2. default (most useful steps)
    3. only verry important things
*/
export function log(s, l = 3, onlySingleLog = false) {
    if (isLoggingMode && logLevel <= l) {
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
    oldLoggings = localStorage.getItem(loggingLocalStorageKey);
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
    oldLoggings = getLoggingsFromLocalStorage();
    if (loggingMax < oldLoggings.length) {
        oldLoggings.splice(0, oldLoggings.length - loggingMax);
    }
    let logEntry = new Date().toLocaleString() + ": " + s
    oldLoggings.push(logEntry);
    localStorage.setItem(loggingLocalStorageKey, JSON.stringify(oldLoggings));
    system.events.dispatchEvent(new CustomEvent('custom-log-changed', { detail: { log: logEntry } }));
}

let SysEvents = function(options) {
    // Create a DOM EventTarget object
    var target = document.createTextNode(null);

    // Pass EventTarget interface calls to DOM EventTarget object
    this.addEventListener = target.addEventListener.bind(target);
    this.removeEventListener = target.removeEventListener.bind(target);
    this.dispatchEvent = function(e) {
        if (e.type != 'custom-log-changed') {
            log(e, 2, "console");
            log(e.constructor.name.toUpperCase() + ": " + e.type, 2, "app");
        }
        return target.dispatchEvent.bind(target)(e);
    }
}

export let events = new SysEvents()

export function init() {
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
}