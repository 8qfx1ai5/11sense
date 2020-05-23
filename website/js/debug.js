let isDebugMode = false;
let isDeveloperMode = false;
let debugButton;
let debugButtonOn;
let debugButtonOff;

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