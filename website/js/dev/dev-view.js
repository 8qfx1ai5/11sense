let dev = {
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
        log("activate dev mode");
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

        registeredSettingsSubpages.push("settings-dev");
        registeredDisplaySubpages.unshift("stats-loggings");
    },

    deactivateDeveloperMode: function() {
        log("deactivate dev mode");
        isDeveloperMode = false;
        localStorage.setItem('isDeveloperMode', false);

        // set color back at dev related elements
        Array.prototype.forEach.call(document.getElementsByClassName("dev-change"), function(element) {
            element.classList.remove("debugging");
        });

        // hide all dev elements
        Array.prototype.forEach.call(document.getElementsByClassName("dev-hidden"), function(element) {
            element.classList.add("hidden");
        });

        // reset subpage navigations
        Array.prototype.forEach.call(document.getElementsByClassName("selector"), function(element) {
            let e = document.getElementById(tagIdDisplaySelector);
            e.selectedIndex = 0;
            e.dispatchEvent(new Event('change'));
        });

        registeredSettingsSubpages = registeredSettingsSubpages.filter(function(value, index, arr) { return value != "settings-dev" })
        registeredDisplaySubpages = registeredDisplaySubpages.filter(function(value, index, arr) { return value != "stats-loggings" })
    },

    toggleLoggingMode: function() {
        if (isLoggingMode) {
            this.deactivateLoggingMode();
        } else {
            this.activateLoggingMode();
        }
    },

    activateLoggingMode: function() {
        isLoggingMode = true;
        localStorage.setItem('isLoggingMode', true);
        document.getElementById(this.tagIdLoggingButton + "-on").classList.remove("hidden");
        document.getElementById(this.tagIdLoggingButton + "-off").classList.add("hidden");
        log("activate logging");
    },

    deactivateLoggingMode: function() {
        log("deactivate logging");
        isLoggingMode = false;
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
        oldLoggings = getLoggingsFromLocalStorage();
        for (i = oldLoggings.length - 1; 0 <= i; i--) {
            entry = document.createElement('li');
            entry.setAttribute("title", oldLoggings[i]);
            content = document.createElement('span');
            text = oldLoggings[i].substring(oldLoggings[i].indexOf(",") + 1);
            content.appendChild(document.createTextNode(text));
            entry.appendChild(content);
            loggingList.append(entry);
        }
    },

    onDocumentReadyEvent: function() {
        displaySelector = document.getElementById(tagIdDisplaySelector);

        // localStorage.setItem("debugLog", "");
        localStorage.setItem('isLoggingMode', "true");
        isLoggingMode = localStorage.getItem('isLoggingMode') != "true";
        this.toggleLoggingMode();
        isDeveloperMode = localStorage.getItem('isDeveloperMode') != "true";
        this.toggleDeveloperMode();

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

        system.events.addEventListener("custom-log-changed", function() {
            dev.updateLoggingsBasedOnLocalStorage();
        });
    }
};

(function() {
    dev.onDocumentReadyEvent();
})();