let isLoggingMode = false;
let isDeveloperMode = false;
let loggingButton;
let loggingButtonOn;
let loggingButtonOff;
let headerDebug;
let headerMainDebug;
let loggingMax = 99;
let logLevel = 3
let devModeClickCounter = 0;
let devModeClickCounterStart;
let displayOptionLoggings;
let displaySelector;
let loggingListId = "logging-list";
let loggingLocalStorageKey = "debugLog";

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
    displayOptionLoggings.classList.remove("hidden");
    displaySelector.classList.add("debugging");
}

function deactivateDeveloperMode() {
    log("deactivate dev mode");
    isDeveloperMode = false;
    localStorage.setItem('isDeveloperMode', false);
    loggingButton.classList.add("hidden");
    headerMainDebug.classList.remove("debugging");
    displayOptionLoggings.classList.add("hidden");
    displaySelector.classList.remove("debugging");
    document.getElementById(displaySelectorId).value = "history";
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
                updateLoggingsBasedOnLocalStorage();
                break;
            default:
                console.log(s);
                saveLogInLocalStorage(s);
                updateLoggingsBasedOnLocalStorage();
                break;
        }
    }
}

function getLoggingsFromLocalStorage() {
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
    oldLoggings.push(new Date().toLocaleString() + ": " + s);
    localStorage.setItem(loggingLocalStorageKey, JSON.stringify(oldLoggings));
}

function updateLoggingsBasedOnLocalStorage() {
    if (!isDeveloperMode) {
        return;
    }
    let loggingList = document.getElementById(loggingListId);
    loggingList.innerHTML = "";
    let oldLoggings = getLoggingsFromLocalStorage();
    for (let i = oldLoggings.length - 1; 0 <= i; i--) {
        let entry = document.createElement('li');
        entry.setAttribute("title", oldLoggings[i]);
        let content = document.createElement('span');
        let text = oldLoggings[i].substring(oldLoggings[i].indexOf(",") + 1);
        content.appendChild(document.createTextNode(text));
        entry.appendChild(content);
        loggingList.append(entry);
    }
}