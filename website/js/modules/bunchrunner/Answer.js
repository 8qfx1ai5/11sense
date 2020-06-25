import * as appTask from './Task.js'

export default class Answer {

    input = "14.79"
    time = performance.now()
    isValid = false
    analizationResult = ""
    outputGUI = "14,79"
    outputSUI = "14,7 9"

    constructor(input, isValid = true, analizationResult = "") {
        this.input = input
        this.isValid = isValid
        this.analizationResult = analizationResult
        this.time = performance.now()
        this.outputGUI = appTask.formatNumberForGUI(input)
        this.outputSUI = appTask.formatNumberForSUI(input)
    }
}