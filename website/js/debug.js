let isDebugMode = false;
let isDeveloperMode = false;
let debugButton = document.getElementById('button-debug')
let debugButtonOn = document.getElementById('debug-button-on')
let debugButtonOff = document.getElementById('debug-button-off')

header.addEventListener('click', function(e) {
    if (e.detail >= 8) {
        toggleDeveloperMode();
        alert('Mode switched.');
    }
});

function toggleDeveloperMode() {
    if (isDeveloperMode) {
        deactivateDeveloperMode();
    } else {
        activateDeveloperMode();
    }
}

function activateDeveloperMode() {
    isDeveloperMode = true;
    localStorage.setItem('isDeveloperMode', true);
    debugButton.classList.remove("hidden");
}

function deactivateDeveloperMode() {
    isDeveloperMode = false;
    localStorage.setItem('isDeveloperMode', false);
    debugButton.classList.add("hidden");
}

debugButton.addEventListener('click', function(e) {
    toggleDebugMode();
});

function toggleDebugMode() {
    if (isDebugMode) {
        deactivateDebugMode();
    } else {
        activateDebugMode();
    }
}

function activateDebugMode() {
    isDebugMode = true;
    localStorage.setItem('isDebugMode', true);
    debugButtonOn.classList.remove("hidden");
    debugButtonOff.classList.add("hidden");
}

function deactivateDebugMode() {
    isDebugMode = false;
    localStorage.setItem('isDebugMode', false);
    debugButtonOn.classList.add("hidden");
    debugButtonOff.classList.remove("hidden");
}

window.onsecuritypolicyviolation = function(error, url, line) {
    if (isDebugMode) {
        let issue = 'ERR:' + error + ' URL:' + url + ' L:' + line;
        localStorage.setItem("debugLog", localStorage.getItem("debugLog") + "\n" + issue);
    }
};

window.onerror = function(error, url, line) {
    if (isDebugMode) {
        let issue = 'ERR:' + error + ' URL:' + url + ' L:' + line;
        localStorage.setItem("debugLog", localStorage.getItem("debugLog") + "\n" + issue);
    }
};

(function() {
    // localStorage.setItem("debugLog", "");
    isDebugMode = localStorage.getItem('isDebugMode') != "true";
    toggleDebugMode();
    isDeveloperMode = localStorage.getItem('isDeveloperMode') != "true";
    toggleDeveloperMode();
})();