export let dev = {
    isDeveloperMode: false,
    tagIdLoggingButton: 'button-logging',
    tagIdHeaderMain: "header-main",
    devModeClickCounter: 0,
    devModeClickCounterStart: 0,
    tagIdloggingList: "logging-list",
    tagIdDisplaySelector: "display-selector",
    tagIdsettingsSelector: "settings-selector",

    toggleDeveloperMode: function() {
        if (isDeveloperMode) {
            this.deactivateDeveloperMode();
        } else {
            this.activateDeveloperMode();
        }
    },

    activateDeveloperMode: function() {
        appSystem.log("activate dev mode");
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
        this.updateLoggingsBasedOnLocalStorage();

        appSubpage.registeredSettingsSubpages.push("settings-dev");
        appSubpage.registeredDisplaySubpages.unshift("stats-loggings");
    },

    deactivateDeveloperMode: function() {
        appSystem.log("deactivate dev mode");
        isDeveloperMode = false;
        localStorage.setItem('isDeveloperMode', false);

        window.location.replace('#');
        window.location.reload();
    },

    toggleLoggingMode: function() {
        if (appSystem.isLoggingMode) {
            this.deactivateLoggingMode();
        } else {
            this.activateLoggingMode();
        }
    },

    activateLoggingMode: function() {
        appSystem.isLoggingMode = true;
        localStorage.setItem('isLoggingMode', true);
        document.getElementById(this.tagIdLoggingButton + "-on").classList.remove("hidden");
        document.getElementById(this.tagIdLoggingButton + "-off").classList.add("hidden");
        appSystem.log("activate logging");
    },

    deactivateLoggingMode: function() {
        appSystem.log("deactivate logging");
        appSystem.isLoggingMode = false;
        localStorage.setItem('isLoggingMode', false);
        document.getElementById(this.tagIdLoggingButton + "-on").classList.add("hidden");
        document.getElementById(this.tagIdLoggingButton + "-off").classList.remove("hidden");
    },

    updateLoggingsBasedOnLocalStorage: function() {
        if (!isDeveloperMode) {
            return;
        }
        loggingList = document.getElementById(dev.tagIdloggingList);
        loggingList.innerHTML = "";
        oldLoggings = appSystem.getLoggingsFromLocalStorage();
        for (i = 0; i < oldLoggings.length; i++) {
            this.updateLoggingAddSingleLine(oldLoggings[i])
        }
    },

    updateLoggingAddSingleLine: function(s) {
        if (!isDeveloperMode) {
            return;
        }
        loggingList = document.getElementById(dev.tagIdloggingList);
        entry = document.createElement('li');
        content = document.createElement('span');
        entry.setAttribute('class', 'tooltip')
        entry.addEventListener('click', function() {
            this.firstChild.firstChild.classList.toggle("tooltipvisible")
        })
        text = s.substring(s.indexOf(",") + 1);
        tooltipText = document.createElement("span")
        tooltipText.classList.add("tooltiptext")
        tooltipText.innerHTML = text
        content.append(tooltipText)
        content.appendChild(document.createTextNode(text));
        entry.append(content);
        loggingList.prepend(entry);
    },

    init: function() {
        displaySelector = document.getElementById(tagIdDisplaySelector);

        // localStorage.setItem("debugLog", "");
        localStorage.setItem('isLoggingMode', "true");
        appSystem.isLoggingMode = localStorage.getItem('isLoggingMode') != "true";
        this.toggleLoggingMode();
        isDeveloperMode = false;
        if (localStorage.getItem('isDeveloperMode') == "true") {
            dev.activateDeveloperMode();
        }

        let headerMain = document.getElementById(this.tagIdHeaderMain);
        headerMain.addEventListener('click', function(e) {
            if (e.detail >= 8) {
                dev.toggleDeveloperMode();
                alert('Mode switched.');
            }
        });

        headerMain.addEventListener('touchstart', function(e) {
            let now = performance.now();
            if (!dev.devModeClickCounterStart || now - dev.devModeClickCounterStart > 1500) {
                dev.devModeClickCounterStart = now;
                dev.devModeClickCounter = 1;
                return;
            }
            dev.devModeClickCounter++;
            if (8 <= dev.devModeClickCounter) {
                dev.toggleDeveloperMode();
                alert('Mode switched.');
                dev.devModeClickCounter = 0;
                dev.devModeClickCounterStart = 0;
            }
        });

        document.getElementById(this.tagIdLoggingButton).addEventListener('click', function(e) {
            dev.toggleLoggingMode();
        });

        appSystem.events.addEventListener("custom-log-changed", function(e) {
            dev.updateLoggingAddSingleLine(e.detail.log);
        });
    }
};