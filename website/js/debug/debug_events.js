(function() {
    loggingButton = document.getElementById('button-logging');
    loggingButtonOn = document.getElementById('logging-button-on');
    loggingButtonOff = document.getElementById('logging-button-off');
    headerDebug = document.getElementById("header");
    headerMainDebug = document.getElementById("header-main");
    displayOptionLoggings = document.getElementById("display-option-loggings");
    displaySelector = document.getElementById("display-selector");

    // localStorage.setItem("debugLog", "");
    localStorage.setItem('isLoggingMode', "true");
    isLoggingMode = localStorage.getItem('isLoggingMode') != "true";
    toggleLoggingMode();
    isDeveloperMode = localStorage.getItem('isDeveloperMode') != "true";
    toggleDeveloperMode();

    headerMainDebug.addEventListener('click', function(e) {
        if (e.detail >= 8) {
            toggleDeveloperMode();
            alert('Mode switched.');
        }
    });

    headerMainDebug.addEventListener('touchstart', function(e) {
        let now = performance.now();
        if (!devModeClickCounterStart || now - devModeClickCounterStart > 1500) {
            devModeClickCounterStart = now;
            devModeClickCounter = 1;
            return;
        }
        devModeClickCounter++;
        if (8 <= devModeClickCounter) {
            toggleDeveloperMode();
            alert('Mode switched.');
            devModeClickCounter = 0;
            devModeClickCounterStart = 0;
        }
    });

    loggingButton.addEventListener('click', function(e) {
        toggleLoggingMode();
    });

    // window.onsecuritypolicyviolation = function(error, url, line) {
    //     if (isLoggingMode) {
    //         let issue = 'ERR:' + error + ' URL:' + url + ' L:' + line;
    //         localStorage.setItem("debugLog", localStorage.getItem("debugLog") + "\n" + issue);
    //     }
    // };

    // window.onerror = function(error, url, line) {
    //     if (isLoggingMode) {
    //         let issue = 'ERR:' + error + ' URL:' + url + ' L:' + line;
    //         localStorage.setItem("debugLog", localStorage.getItem("debugLog") + "\n" + issue);
    //     }
    // };
})();