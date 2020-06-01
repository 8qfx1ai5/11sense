let isLoggingMode = false;
let loggingMax = 99;
let logLevel = 1;
let loggingLocalStorageKey = "debugLog";

/*
    log levels:
    1. log absolutely everything
    2. default (most useful steps)
    3. only verry important things
*/
function log(s, l = 3, onlySingleLog = false) {
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

function getLoggingsFromLocalStorage() {
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
    oldLoggings.push(new Date().toLocaleString() + ": " + s);
    localStorage.setItem(loggingLocalStorageKey, JSON.stringify(oldLoggings));
    system.events.dispatchEvent(new Event('custom-log-changed'));
}

var SysEvents = function(options) {
    // Create a DOM EventTarget object
    var target = document.createTextNode(null);

    // Pass EventTarget interface calls to DOM EventTarget object
    this.addEventListener = target.addEventListener.bind(target);
    this.removeEventListener = target.removeEventListener.bind(target);
    this.dispatchEvent = target.dispatchEvent.bind(target);
}

let system = {

    events: new SysEvents(),

    registerEventListeners: function() {
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
    },
};

(function() {
    system.registerEventListeners();
})();