import * as appSystem from '../main/system.js'
import * as appPage from '../page/page.js'

export let appDev = {
    isDeveloperMode: false,
    tagIdHeaderMain: "header-main",
    devModeClickCounter: 0,
    devModeClickCounterStart: 0,
    tagIdloggingList: "logging-list",
    tagIdDisplaySelector: "display-selector",
    tagIdsettingsSelector: "settings-selector",

    toggleDeveloperMode: function() {
        if (appDev.isDeveloperMode) {
            appDev.deactivateDeveloperMode();
        } else {
            appDev.activateDeveloperMode();
        }
    },

    activateDeveloperMode: function() {
        appSystem.log("activate dev mode");
        appDev.isDeveloperMode = true;
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
        appDev.updateLoggingsBasedOnLocalStorage();

        appPage.registeredSettingsSubpages.push("settings-dev");
        appPage.registeredDisplaySubpages.unshift("stats-loggings");
    },

    deactivateDeveloperMode: function() {
        appSystem.log("deactivate dev mode");
        appDev.isDeveloperMode = false;
        localStorage.setItem('isDeveloperMode', false);

        window.location.replace('#');
        window.location.reload();
    },

    updateLoggingsBasedOnLocalStorage: function() {
        if (!appDev.isDeveloperMode) {
            return;
        }
        let loggingList = document.getElementById(appDev.tagIdloggingList);
        loggingList.innerHTML = "";
        let oldLoggings = appSystem.getLoggingsFromLocalStorage();
        for (let i = 0; i < oldLoggings.length; i++) {
            appDev.updateLoggingAddSingleLine(oldLoggings[i])
        }
    },

    updateLoggingAddSingleLine: function(s) {
        if (!appDev.isDeveloperMode) {
            return;
        }
        let loggingList = document.getElementById(appDev.tagIdloggingList);
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
    },

    init: function() {
        // localStorage.setItem("debugLog", "");

        appDev.isDeveloperMode = false;
        if (localStorage.getItem('isDeveloperMode') == "true") {
            appDev.activateDeveloperMode();
        }

        let headerMain = document.getElementById(appDev.tagIdHeaderMain);
        headerMain.addEventListener('click', function(e) {
            if (e.detail >= 8) {
                appDev.toggleDeveloperMode();
                alert('Mode switched.');
            }
        });

        headerMain.addEventListener('touchstart', function(e) {
            let now = performance.now();
            if (!appDev.devModeClickCounterStart || now - appDev.devModeClickCounterStart > 1500) {
                appDev.devModeClickCounterStart = now;
                appDev.devModeClickCounter = 1;
                return;
            }
            appDev.devModeClickCounter++;
            if (8 <= appDev.devModeClickCounter) {
                appDev.toggleDeveloperMode();
                alert('Mode switched.');
                appDev.devModeClickCounter = 0;
                appDev.devModeClickCounterStart = 0;
            }
        });

        appSystem.events.addEventListener("custom-log-changed", function(e) {
            appDev.updateLoggingAddSingleLine(e.detail.log);
        });
    }
};