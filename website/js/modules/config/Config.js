import * as appSystem from '../main/system.js'

export default class Config {
    configID = false
    solutionGuideTime = 10000
    autoTaskTime = 5000
    language = "de"
    numberRange1 = [2, 10]
    numberRange2 = [2, 10]
    isDecimalPlacesMode = false
    isRacingMode = false
    bunchSize = 10
    operator = '+'
    isHideTaskModeActive = false

    constructor() {
        if (!localStorage.getItem('number1Range') || !localStorage.getItem('number2Range') || !localStorage.getItem('bunchSize') || !localStorage.getItem('selectedOperator')) {
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