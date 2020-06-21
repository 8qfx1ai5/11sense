import * as appSystem from '../main/system.js'
import * as bunchRunner from './bunchRunner.js'

let localStorageKeySolutionGuideInterval = "solution-guide-interval"
let tagIdSolutionGuideInput = "solution-guide-selector"
let solutionGuideInterval = false
let solutionGuideIntervalObject = false

export function isSolutionGuideActive() {
    return getSolutionGuideInterval()
}

function getSolutionGuideInterval() {
    return solutionGuideInterval
}

function saveSolutionGuideInterval() {
    let v = document.getElementById(tagIdSolutionGuideInput).value
    if (v == "" || v == "-" || v == "off") {
        localStorage.setItem(localStorageKeySolutionGuideInterval, false)
        solutionGuideInterval = false
        stopSolutionGuideLoop()
        return
    }
    localStorage.setItem(localStorageKeySolutionGuideInterval, v * 1000)
    solutionGuideInterval = v * 1000
    startNewSolutionGuideLoop()
}

export function stopSolutionGuideLoop() {
    appSystem.log("stop solution guide loop", 1)
    if (solutionGuideIntervalObject) {
        clearTimeout(solutionGuideIntervalObject)
    }
    solutionGuideIntervalObject = false
}

export function startNewSolutionGuideLoop() {
    stopSolutionGuideLoop()
    if (!isSolutionGuideActive()) {
        return
    }
    if (!bunchRunner.isRunning()) {
        return
    }
    let interval = getSolutionGuideInterval()
    appSystem.log("start new solution guide loop: '" + interval + "'", 2)
    solutionGuideIntervalObject = setTimeout(function() {
        appSystem.events.dispatchEvent(new CustomEvent('solution-timed-out'))
    }, interval)
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