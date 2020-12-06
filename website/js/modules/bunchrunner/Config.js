import * as appSystem from '../main/system.js'

export default class Config {
    configID = false
    solutionGuideTime = 10000
    autoTaskTime = 5000
    language = "de"
    numberRanges = [2, 3]
    isDecimalPlacesMode = false
    isRacingMode = false
    bunchSize = 10
    operator = '+'

    constructor() {
        this.numberRanges[0] = parseInt(document.getElementById('f1').value, 10);
        this.numberRanges[1] = parseInt(document.getElementById('f2').value, 10);

        this.bunchSize = parseInt(document.getElementById('bunch-size-selector').value, 10);
        this.isDecimalPlacesMode = localStorage.getItem('isDecimalPlacesModeActive') == "true"
        this.isRacingMode = localStorage.getItem('isRacingModeActive') == "true"
        this.operator = localStorage.getItem('operator')
    }
}

export function init() {
    document.getElementById('bunch-size-selector').addEventListener('change', (e) => {
        window.dispatchEvent(new CustomEvent('bunch-request-new'))
    })

    document.getElementById(tagIdRacingMode).addEventListener('click', function(e) {
        toggleRacingMode();
    });

    localStorage.setItem('isRacingModeActive', localStorage.getItem('isRacingModeActive') != "true");
    toggleRacingMode();

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