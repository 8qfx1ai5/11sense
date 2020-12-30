import * as appSystem from '../main/system.js'

let isDeveloperMode = false
let tagIdHeaderMain = "header-main"
let devModeClickCounter = 0
let devModeClickCounterStart = 0
let tagIdloggingList = "logging-list"

function toggleDeveloperMode() {
    if (isDeveloperMode) {
        deactivateDeveloperMode();
    } else {
        activateDeveloperMode();
    }
}

function activateDeveloperMode() {
    appSystem.log("activate dev mode", 1);
    isDeveloperMode = true;
    localStorage.setItem('isDeveloperMode', true);

    // change color on dev related elements
    Array.prototype.forEach.call(document.getElementsByClassName("dev-change"), function(element) {
        element.classList.add("debugging");
    });

    // show all dev elements
    Array.prototype.forEach.call(document.getElementsByClassName("dev-hidden"), function(element) {
        element.classList.remove("hidden");
    });

    // update logging view
    updateLoggingsBasedOnLocalStorage();
}

function deactivateDeveloperMode() {
    appSystem.log("deactivate dev mode", 1);
    isDeveloperMode = false;
    localStorage.setItem('isDeveloperMode', false);

    window.location.replace('#');
    window.location.reload();
}

function updateLoggingsBasedOnLocalStorage() {
    if (!isDeveloperMode) {
        return;
    }
    let loggingList = document.getElementById(tagIdloggingList);
    loggingList.innerHTML = "";
    let oldLoggings = appSystem.getLoggingsFromLocalStorage();
    for (let i = 0; i < oldLoggings.length; i++) {
        updateLoggingAddSingleLine(oldLoggings[i])
    }
}

function updateLoggingAddSingleLine(s) {
    if (!isDeveloperMode) {
        return;
    }
    let loggingList = document.getElementById(tagIdloggingList);
    let entry = document.createElement('li');
    let content = document.createElement('span');
    entry.setAttribute('class', 'tooltip')
    entry.addEventListener('click', function() {
        this.firstChild.firstChild.classList.toggle("tooltipvisible")
    })
    let text = s.substring(s.indexOf(",") + 1);
    let tooltipText = document.createElement("span")
    tooltipText.classList.add("tooltiptext")
    tooltipText.innerHTML = text
    content.append(tooltipText)
    content.appendChild(document.createTextNode(text));
    entry.append(content);
    loggingList.prepend(entry);
}

export function init() {

    isDeveloperMode = false;
    if (localStorage.getItem('isDeveloperMode') == "true") {
        activateDeveloperMode();
    }

    let headerMain = document.getElementById(tagIdHeaderMain);
    headerMain.addEventListener('click', function(e) {
        if (e.detail == 8) {
            toggleDeveloperMode();
        }
    });

    headerMain.addEventListener('touchstart', function(e) {
        let now = performance.now();
        if (!devModeClickCounterStart || now - devModeClickCounterStart > 1500) {
            devModeClickCounterStart = now;
            devModeClickCounter = 1;
            return;
        }
        devModeClickCounter++;
        if (devModeClickCounter == 8) {
            toggleDeveloperMode();
            devModeClickCounter = 0;
            devModeClickCounterStart = 0;
        }
    });

    appSystem.events.addEventListener("custom-log-changed", function(e) {
        updateLoggingAddSingleLine(e.detail.log);
    });
}