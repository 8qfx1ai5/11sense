import * as appSystem from '../main/system.js'

let preconfiguredLevels = {

    "add_race_1": {
        "solutionGuideTime": false,
        "autoTaskTime": 0,
        "numberRange0": false,
        "numberRange1": [2, 10],
        "numberRange2": [2, 10],
        "isDecimalPlacesMode": false,
        "isRacingMode": true,
        "bunchSize": 10,
        "operator": '+',
        "isHideTaskModeActive": false,
        "title": "Title",
        "desciption": "Description",
        "successTime": 100000,
        "successMessage": "Well done. If you feel comfortable, you should level up.",
        "failureMessage": "There is a lot of potential. Continue training and you will grow and rise.",
    },
    "add_race_2": {
        "solutionGuideTime": false,
        "autoTaskTime": 0,
        "numberRange0": false,
        "numberRange1": [2, 10],
        "numberRange2": [2, 10],
        "isDecimalPlacesMode": false,
        "isRacingMode": true,
        "bunchSize": 10,
        "operator": '+',
        "isHideTaskModeActive": true,
        "title": "Title",
        "desciption": "Description",
        "successTime": 100000,
        "successMessage": "Well done. If you feel comfortable, you should level up.",
        "failureMessage": "There is a lot of potential. Continue training and you will grow and rise.",
    },
    "add_race_3": {
        "solutionGuideTime": false,
        "autoTaskTime": 0,
        "numberRange0": false,
        "numberRange1": [99, 999],
        "numberRange2": [2, 10],
        "isDecimalPlacesMode": false,
        "isRacingMode": true,
        "bunchSize": 10,
        "operator": '+',
        "isHideTaskModeActive": true,
        "title": "Title",
        "desciption": "Description",
        "successTime": 100000,
        "successMessage": "Well done. If you feel comfortable, you should level up.",
        "failureMessage": "There is a lot of potential. Continue training and you will grow and rise.",
    },
    "add_race_4": {
        "solutionGuideTime": false,
        "autoTaskTime": 0,
        "numberRange0": false,
        "numberRange1": [2, 10],
        "numberRange2": [11, 20],
        "isDecimalPlacesMode": false,
        "isRacingMode": true,
        "bunchSize": 10,
        "operator": '+',
        "isHideTaskModeActive": true,
        "title": "Title",
        "desciption": "Description",
        "successTime": 100000,
        "successMessage": "Well done. If you feel comfortable, you should level up.",
        "failureMessage": "There is a lot of potential. Continue training and you will grow and rise.",
    },
    "add_race_5": {
        "solutionGuideTime": false,
        "autoTaskTime": 0,
        "numberRange0": false,
        "numberRange1": [99, 999],
        "numberRange2": [11, 20],
        "isDecimalPlacesMode": false,
        "isRacingMode": true,
        "bunchSize": 10,
        "operator": '+',
        "isHideTaskModeActive": true,
        "title": "Title",
        "desciption": "Description",
        "successTime": 100000,
        "successMessage": "Well done. If you feel comfortable, you should level up.",
        "failureMessage": "There is a lot of potential. Continue training and you will grow and rise.",
    },
    "add_1": {
        "solutionGuideTime": 20000,
        "autoTaskTime": 3000,
        "numberRange0": false,
        "numberRange1": [2, 10],
        "numberRange2": [2, 10],
        "isDecimalPlacesMode": false,
        "isRacingMode": false,
        "bunchSize": 10,
        "operator": '+',
        "isHideTaskModeActive": false,
        "title": "Title",
        "desciption": "Description",
        "successTime": 100000,
        "successMessage": "Well done. If you feel comfortable, you should level up.",
        "failureMessage": "There is a lot of potential. Continue training and you will grow and rise.",
    },
    "mult_1": {
        "solutionGuideTime": 20000,
        "autoTaskTime": 5000,
        "numberRange0": false,
        "numberRange1": [2, 10],
        "numberRange2": [2, 10],
        "isDecimalPlacesMode": false,
        "isRacingMode": false,
        "bunchSize": 10,
        "operator": '*',
        "isHideTaskModeActive": false,
        "title": "Title",
        "desciption": "Description",
        "successTime": 100000,
        "successMessage": "Well done. If you feel comfortable, you should level up.",
        "failureMessage": "There is a lot of potential. Continue training and you will grow and rise.",
    }
}

export default class Config {
    configID = false
    solutionGuideTime = 10000
    autoTaskTime = 5000
    language = "de"
    numberRange0 = [2, 10] // or false
    numberRange1 = [2, 10]
    numberRange2 = [2, 10]
    isDecimalPlacesMode = false
    isRacingMode = false
    bunchSize = 10
    operator = '+'
    isHideTaskModeActive = false
    title = "Custom Mode"
    desciption = "We use your manual configuration.\n(You can change the settings or select a preconfigured level in the nav on the right side.)"
    successTime = 100000
    successMessage = "Well done."
    failureMessage = "There is a lot of potential. Continue training and you will grow and rise."

    constructor() {
        let defaultParams = ['number0Range', 'number1Range', 'number2Range', 'bunchSize', 'selectedOperator']
        for (let i = 0; i < defaultParams.length; i++) {
            // TODO: find some better way to initialize the default values
            if (!localStorage.getItem(defaultParams[i])) {
                setTimeout(function() {
                    // wait some time and try again
                    window.dispatchEvent(new CustomEvent('config_changed'))
                }, 500)
                return
            }
        }

        let f0 = localStorage.getItem('number0Range').split('-')
        this.numberRange0 = false
        if (1 < f0.length) {
            this.numberRange0 = [parseInt(f0[0], 10), parseInt(f0[1], 10)]
        }
        let f1 = localStorage.getItem('number1Range').split('-')
        this.numberRange1 = [parseInt(f1[0], 10), parseInt(f1[1], 10)]
        let f2 = localStorage.getItem('number2Range').split('-')
        this.numberRange2 = [parseInt(f2[0], 10), parseInt(f2[1], 10)]

        this.bunchSize = parseInt(localStorage.getItem('bunchSize'), 10);
        this.isDecimalPlacesMode = localStorage.getItem('decimalPlacesMode') == "on"
        this.isRacingMode = localStorage.getItem('racingMode') == "on"
        this.isHideTaskModeActive = localStorage.getItem('hideTaskMode') == "on"
        this.operator = localStorage.getItem('selectedOperator')
    }
}

export function init() {

    window.addEventListener('config_changed', function(e) {
        appSystem.log(e, 2, "console");
        appSystem.log(e.constructor.name.toUpperCase() + ": " + e.type, 2, "app");
        window.dispatchEvent(new CustomEvent('bunch-request-new'))
    })

}