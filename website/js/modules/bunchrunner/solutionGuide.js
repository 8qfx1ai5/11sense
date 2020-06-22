import * as appSystem from '../main/system.js'
import * as bunchRunner from './bunchRunner.js'

let localStorageKeySolutionGuideInterval = "solution-guide-interval"
let tagIdSolutionGuideInput = "solution-guide-selector"
let solutionGuideInterval = false
let solutionGuideIntervalObject = false

export function isActive() {
    return getSolutionGuideInterval() !== false
}

function getSolutionGuideInterval() {
    return solutionGuideInterval
}

function saveSolutionGuideInterval() {
    let v = document.getElementById(tagIdSolutionGuideInput).value
    if (v == "" || v == "-" || v == "off") {
        localStorage.setItem(localStorageKeySolutionGuideInterval, false)
        solutionGuideInterval = false
        stop()
        return
    }
    localStorage.setItem(localStorageKeySolutionGuideInterval, v * 1000)
    solutionGuideInterval = v * 1000
}

export function stop() {
    appSystem.log("stop solution guide loop", 1)
    if (solutionGuideIntervalObject) {
        clearTimeout(solutionGuideIntervalObject)
    }
    solutionGuideIntervalObject = false
}

export function start(taskIndex) {
    stop()
    if (!isActive()) {
        return
    }
    if (!bunchRunner.isRunning()) {
        return
    }
    let interval = getSolutionGuideInterval()
    appSystem.log("start new solution guide loop: '" + interval + "'", 2)
    solutionGuideIntervalObject = setTimeout(function(taskIndex) {
        window.dispatchEvent(new CustomEvent('bunch-request-solution-timed-out', {
            detail: { taskIndex: taskIndex }
        }))
    }, interval, taskIndex)
}

export function init() {
    document.getElementById(tagIdSolutionGuideInput).addEventListener('change', saveSolutionGuideInterval)

    let ii = localStorage.getItem(localStorageKeySolutionGuideInterval)
    if (ii == "false") {
        document.getElementById(tagIdSolutionGuideInput).value = "off"
    } else if (Number(ii)) {
        document.getElementById(tagIdSolutionGuideInput).value = ii / 1000
    }
    saveSolutionGuideInterval()
}