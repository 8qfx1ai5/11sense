import * as appSystem from '../main/system.js'
import * as bunchRunner from './bunchRunner.js'
import * as appConfig from '../config/ConfigStateMachine.js'

let solutionGuideIntervalObject = false

export function isActive() {
    return getSolutionGuideInterval() !== false
}

function getSolutionGuideInterval() {
    let interval = appConfig.currentConfig.getValue('solutionGuideTime')
    if (!interval || interval === 0) {
        return false
    }
    return interval
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