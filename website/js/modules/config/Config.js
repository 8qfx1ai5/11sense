import * as appSystem from '../main/system.js'

export default class Config {
    configID = false
    solutionGuideTime = 10000
    autoTaskTime = 5000
    language = "de"
        // numberRanges = [2, 3]
    numberRange1 = [2, 10]
    numberRange2 = [2, 10]
    isDecimalPlacesMode = false
    isRacingMode = false
    bunchSize = 10
    operator = '+'
    isHideTaskModeActive = false

    constructor() {
        if (!localStorage.getItem('number1Range') || !localStorage.getItem('number2Range')) {
            setTimeout(function() {
                // wait until the config is initialized
                window.dispatchEvent(new CustomEvent('config_changed'))
            }, 500)
            return
        }
        let f1 = localStorage.getItem('number1Range').split('-')
        this.numberRange1 = [parseInt(f1[0], 10), parseInt(f1[1], 10)]
        let f2 = localStorage.getItem('number2Range').split('-')
        this.numberRange2 = [parseInt(f2[0], 10), parseInt(f2[1], 10)]

        this.bunchSize = parseInt(document.getElementById('bunch-size-selector').value, 10);
        this.isDecimalPlacesMode = localStorage.getItem('isDecimalPlacesModeActive') == "true"
        this.isRacingMode = localStorage.getItem('isRacingModeActive') == "true"
        this.isHideTaskModeActive = localStorage.getItem('isHideTaskModeActive') == "true"
        this.operator = localStorage.getItem('operator')
    }
}

export function init() {

    window.addEventListener('config_changed', function(e) {
        appSystem.log(e, 2, "console");
        appSystem.log(e.constructor.name.toUpperCase() + ": " + e.type, 2, "app");
        window.dispatchEvent(new CustomEvent('bunch-request-new'))
    })

    document.getElementById('bunch-size-selector').addEventListener('change', (e) => {
        window.dispatchEvent(new CustomEvent('bunch-request-new'))
    })

    document.getElementById(tagIdRacingMode).addEventListener('click', function(e) {
        toggleRacingMode();
    });

    localStorage.setItem('isRacingModeActive', localStorage.getItem('isRacingModeActive') != "true");
    toggleRacingMode();

    document.getElementById(tagIdHideTaskMode).addEventListener('click', function(e) {
        toggleHideTaskMode();
    });

    localStorage.setItem('isHideTaskModeActive', localStorage.getItem('isHideTaskModeActive') != "true");
    toggleHideTaskMode();

    if (localStorage.getItem('operator')) {
        document.getElementById('operator-selector').value = localStorage.getItem('operator')
    }
    document.getElementById('operator-selector').addEventListener('change', (e) => {
        localStorage.setItem('operator', document.getElementById('operator-selector').value)
    })
}

function toggleRacingMode() {
    if (localStorage.getItem('isRacingModeActive') == "true") {
        deactivateRacingMode();
    } else {
        activateRacingMode();
    }
}

let tagIdRacingMode = 'button-racing'

function activateRacingMode() {
    appSystem.log("activate racing mode");
    localStorage.setItem('isRacingModeActive', true);
    document.getElementById(tagIdRacingMode + "-on").classList.remove("hidden");
    document.getElementById(tagIdRacingMode + "-off").classList.add("hidden");
}

function deactivateRacingMode() {
    appSystem.log("deactivate racing mode");
    localStorage.setItem('isRacingModeActive', false);
    document.getElementById(tagIdRacingMode + "-on").classList.add("hidden");
    document.getElementById(tagIdRacingMode + "-off").classList.remove("hidden");
}

function toggleHideTaskMode() {
    if (localStorage.getItem('isHideTaskModeActive') == "true") {
        deactivateHideTaskMode();
    } else {
        activateHideTaskMode();
    }
}

let tagIdHideTaskMode = 'button-hide-task'

function activateHideTaskMode() {
    appSystem.log("activate hide task mode");
    localStorage.setItem('isHideTaskModeActive', true);
    document.getElementById(tagIdHideTaskMode + "-on").classList.remove("hidden");
    document.getElementById(tagIdHideTaskMode + "-off").classList.add("hidden");
}

function deactivateHideTaskMode() {
    appSystem.log("deactivate hide task mode");
    localStorage.setItem('isHideTaskModeActive', false);
    document.getElementById(tagIdHideTaskMode + "-on").classList.add("hidden");
    document.getElementById(tagIdHideTaskMode + "-off").classList.remove("hidden");
}