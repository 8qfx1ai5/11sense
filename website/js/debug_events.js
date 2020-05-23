(function() {
    debugButton = document.getElementById('button-debug');
    debugButtonOn = document.getElementById('debug-button-on');
    debugButtonOff = document.getElementById('debug-button-off');

    // localStorage.setItem("debugLog", "");
    isDebugMode = localStorage.getItem('isDebugMode') != "true";
    toggleDebugMode();
    isDeveloperMode = localStorage.getItem('isDeveloperMode') != "true";
    toggleDeveloperMode();

    header.addEventListener('click', function(e) {
        if (e.detail >= 8) {
            toggleDeveloperMode();
            alert('Mode switched.');
        }
    });

    debugButton.addEventListener('click', function(e) {
        toggleDebugMode();
    });

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
})();