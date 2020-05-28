let isLoggingMode = false;
let isDeveloperMode = false;
let loggingButton;
let loggingButtonOn;
let loggingButtonOff;
let headerDebug;
let headerMainDebug;
let loggingMax = 10000;
let logLevel = 2
let devModeClickCounter = 0;
let devModeClickCounterStart;

function toggleDeveloperMode() {
    if (isDeveloperMode) {
        deactivateDeveloperMode();
    } else {
        activateDeveloperMode();
    }
}

function activateDeveloperMode() {
    log("activate dev mode");
    isDeveloperMode = true;
    localStorage.setItem('isDeveloperMode', true);
    loggingButton.classList.remove("hidden");
    headerMainDebug.classList.add("debugging");
}

function deactivateDeveloperMode() {
    log("deactivate dev mode");
    isDeveloperMode = false;
    localStorage.setItem('isDeveloperMode', false);
    loggingButton.classList.add("hidden");
    headerMainDebug.classList.remove("debugging");
}

function toggleLoggingMode() {
    if (isLoggingMode) {
        deactivateLoggingMode();
    } else {
        activateLoggingMode();
    }
}

function activateLoggingMode() {
    isLoggingMode = true;
    localStorage.setItem('isLoggingMode', true);
    loggingButtonOn.classList.remove("hidden");
    loggingButtonOff.classList.add("hidden");
    log("activate logging");
}

function deactivateLoggingMode() {
    log("deactivate logging");
    isLoggingMode = false;
    localStorage.setItem('isLoggingMode', false);
    loggingButtonOn.classList.add("hidden");
    loggingButtonOff.classList.remove("hidden");
}

function log(s, l = 2) {
    if (isLoggingMode && l <= logLevel) {
        console.log(s);
        let currentLog = localStorage.getItem("debugLog");
        if (!currentLog) {
            currentLog = "";
        }
        if (loggingMax < currentLog.length) {
            currentLog = currentLog.substr(currentLog.length - loggingMax);
        }
        localStorage.setItem("debugLog", currentLog + "|||" + new Date().toLocaleString() + ": " + s);
    }
}