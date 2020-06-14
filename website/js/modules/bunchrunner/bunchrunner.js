import * as appMath from '../math/math.js'

let taskList = []
let currentTaskIndex = 0
let isRunningActive = false

export function isRunning() {
    return isRunningActive
}

export function init() {
    window.addEventListener('bunch-request-runner-pause', () => {
        if (!isRunning()) {
            return;
        }
        isRunningActive = false
        window.dispatchEvent(new CustomEvent('bunch-action-pause'))
    })

    window.addEventListener('bunch-request-runner-start', () => {
        if (isRunning()) {
            return;
        }
        isRunningActive = true
        window.dispatchEvent(new CustomEvent('bunch-action-start'))
    })

    window.addEventListener('bunch-request-next-task', function(e) {
        if (taskList.length == 0) {
            appMath.newTask();
            return;
        }
        if (currentTaskIndex + 1 < taskList.length) {
            // TODO: display next task
        }
    })

    window.addEventListener('bunch-request-previous-task', function(e) {
        appMath.newTask();
    })
}