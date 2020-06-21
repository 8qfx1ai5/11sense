import * as appSystem from '../main/system.js'
import * as solutionGuide from './solutionGuide.js'
import * as autoTask from './autoTask.js'
import Task from './Task.js'

let state = {
    taskList: [],
    currentTaskIndex: 0,
    startTime: false,
    endTime: false,
    config: {
        configID: false,
        solutionGuideTime: 10000,
        autoTaskTime: 5000,
        language: "de",
        numberRanges: [2, 3],
        isDecimalPlacesMode: false,
    },
    isRunningActive: false,
}

let events = [
    'bunch-action-start',
    'bunch-action-pause',
    'bunch-action-task-next',
    'bunch-action-task-previous',
    'bunch-action-solution-found',
    'bunch-action-solution-partial-found',
    'bunch-action-solution-invalid',
    'bunch-action-solution-timed-out',
]
let localStorageBunchSizeKey = 'bunchSize'

export function isRunning() {
    return state['isRunningActive']
}

export function init() {
    solutionGuide.init()
    autoTask.init()

    window.addEventListener('bunch-request-runner-pause', (e) => {
        appSystem.log(e, 2, "console");
        appSystem.log(e.constructor.name.toUpperCase() + ": " + e.type, 2, "app");
        if (!isRunning()) {
            appSystem.log("SKIP: bunch runner already pausing")
            return;
        }
        state['isRunningActive'] = false
        solutionGuide.stopSolutionGuideLoop()
        autoTask.stopAutoTask()
        window.dispatchEvent(new CustomEvent('bunch-action-pause', {
            detail: {
                state: state
            }
        }))
    })

    window.addEventListener('bunch-request-runner-start', (e) => {
        appSystem.log(e, 2, "console");
        appSystem.log(e.constructor.name.toUpperCase() + ": " + e.type, 2, "app");
        if (isRunning()) {
            appSystem.log("SKIP: bunch runner already running")
            return;
        }
        state['isRunningActive'] = true
        window.dispatchEvent(new CustomEvent('bunch-action-start', {
            detail: {
                state: state
            }
        }))
        window.dispatchEvent(new CustomEvent('bunch-request-next-task'))
    })

    window.addEventListener('bunch-request-next-task', function(e) {
        appSystem.log(e, 2, "console");
        appSystem.log(e.constructor.name.toUpperCase() + ": " + e.type, 2, "app");
        if (state['taskList'].length == 0) {
            appSystem.log("SKIP: task list empty")
            return
        } else if (!state['currentTaskIndex']) {
            // new bunch was created, so start with first task
            state['currentTaskIndex'] = 0
        } else if (state['currentTaskIndex'] + 1 == state['taskList'].length) {
            appSystem.log("SKIP: there is no next task")
            window.dispatchEvent(new CustomEvent('bunch-request-new'))
            return
        } else {
            // display next task
            state['currentTaskIndex']++
        }

        solutionGuide.startNewSolutionGuideLoop()
        autoTask.stopAutoTask()
        if (!getTask()['startTime']) {
            state['taskList'][state['currentTaskIndex']]['startTime'] = performance.now()
        }

        window.dispatchEvent(new CustomEvent('bunch-action-task-next', {
            detail: {
                state: state
            }
        }))
    })

    window.addEventListener('bunch-request-previous-task', function(e) {
        appSystem.log(e, 2, "console");
        appSystem.log(e.constructor.name.toUpperCase() + ": " + e.type, 2, "app");
        if (!state['currentTaskIndex'] || state['currentTaskIndex'] == 0) {
            appSystem.log("SKIP: there is no previous-task")
            return
        } else {
            // display previous task
            state['currentTaskIndex']--
        }

        solutionGuide.startNewSolutionGuideLoop()
        autoTask.stopAutoTask()
        if (!getTask()[startTime]) {
            state['taskList'][state['currentTaskIndex']]['startTime'] = performance.now()
        }

        window.dispatchEvent(new CustomEvent('bunch-action-task-previous', {
            detail: {
                state: state
            }
        }))
    })

    window.addEventListener('bunch-request-new', function(e) {
        appSystem.log(e, 2, "console");
        appSystem.log(e.constructor.name.toUpperCase() + ": " + e.type, 2, "app");

        updateConfig()

        for (let i = 0; i < getBunchSize(); i++) {
            state['taskList'].push(new Task(state['config']))
        }
        state['currentTaskIndex'] = false
        window.dispatchEvent(new CustomEvent('bunch-request-next-task'))
    })

    window.addEventListener('bunch-request-possible-solution-input', function(e) {
        appSystem.log(e, 2, "console");
        appSystem.log(e.constructor.name.toUpperCase() + ": " + e.type, 2, "app");

        if (getTask(e.detail.taskIndex).isValidSolution(e.detail.input)) {
            window.dispatchEvent(new CustomEvent('bunch-request-solution-input', {
                detail: e.detail
            }))
        }
    })

    window.addEventListener('bunch-request-solution-input', function(e) {
        appSystem.log(e, 2, "console");
        appSystem.log(e.constructor.name.toUpperCase() + ": " + e.type, 2, "app");

        if (e.detail.taskIndex != state['currentTaskIndex']) {
            appSystem.log("SKIP: you can only solve the current task")
            return
        }

        if (getTask(e.detail.taskIndex).isValidSolution(e.detail.input)) {
            solutionGuide.stopSolutionGuideLoop()
            autoTask.startAutoTask()
            state['taskList'][e.detail.taskIndex].endTime = performance.now()
            window.dispatchEvent(new CustomEvent('bunch-action-solution-found', {
                detail: {
                    state: state
                }
            }))
            return
        } else if (getTask(e.detail.taskIndex).isPartialSolution(e.detail.input)) {
            window.dispatchEvent(new CustomEvent('bunch-action-solution-partial-found', {
                detail: {
                    state: state
                }
            }))
            return
        }
        window.dispatchEvent(new CustomEvent('bunch-action-solution-invalid', {
            detail: {
                state: state
            }
        }))
    })

    window.addEventListener('bunch-request-solution-timed-out', function(e) {
        appSystem.log(e, 2, "console");
        appSystem.log(e.constructor.name.toUpperCase() + ": " + e.type, 2, "app");
        if (getTask(e.detail.taskIndex).endTime) {
            appSystem.log("SKIP: task was already finished")
            return
        }
        state['taskList'][e.detail.taskIndex].endTime = performance.now()
        solutionGuide.stopSolutionGuideLoop()
        autoTask.startAutoTask()
        window.dispatchEvent(new CustomEvent('bunch-action-solution-timed-out', {
            detail: {
                state: state
            }
        }))
    })

    events.forEach((event) => {
        window.addEventListener(event, function(e) {
            appSystem.log(e, 2, "console");
            appSystem.log(e.constructor.name.toUpperCase() + ": " + e.type, 2, "app");
        })
    })
}

function getTask(index = false) {
    if (!index) {
        index = state['currentTaskIndex']
    }
    return state['taskList'][index]
}

function getBunchSize() {
    return Math.max(localStorage.getItem(localStorageBunchSizeKey), 1)
}

function updateConfig() {
    state.config['numberRanges'][0] = parseInt(document.getElementById('f1').value, 10);
    state.config['numberRanges'][1] = parseInt(document.getElementById('f2').value, 10);
}