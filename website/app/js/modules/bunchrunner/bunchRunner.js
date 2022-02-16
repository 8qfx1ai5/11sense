import * as appSystem from '../main/system.js'
import * as solutionGuide from './solutionGuide.js'
import * as autoTask from './autoTask.js'
import State from './State.js'
import * as BunchFactory from './BunchFactory.js'

let state = new State()

export function getState() {
    return state
}

export let events = [
    'bunch-action-new',
    'bunch-action-start',
    'bunch-action-pause',
    'bunch-action-submit',
    'bunch-action-task-next',
    'bunch-action-task-previous',
    'bunch-action-solution-found',
    'bunch-action-solution-partial-found',
    'bunch-action-solution-invalid',
    'bunch-action-solution-timed-out',
]
let localStorageBunchSizeKey = 'bunchSize'

export function isRunning() {
    return state.isRunning
}

export function init() {

    window.addEventListener('bunch-request-runner-pause', (e) => {
        if (!isRunning()) {
            appSystem.log("SKIP: bunch runner already pausing")
            return;
        }
        state.isRunning = false
        if (!state.getTask().isSolved && !state.getTask().wasTimedOut) {
            state.taskList[state.currentTaskIndex].wasPaused = true
        }

        solutionGuide.stop()
        autoTask.stop()
        window.dispatchEvent(new CustomEvent('bunch-action-pause', { detail: { state: state } }))
    })

    window.addEventListener('bunch-request-runner-start', (e) => {
        if (isRunning()) {
            appSystem.log("SKIP: bunch runner already running")
            return;
        }
        state.isRunning = true
        state.startTime = performance.now()
        window.dispatchEvent(new CustomEvent('bunch-action-start', { detail: { state: state } }))
        let i = 0
        for (; i < state.taskList.length; i++) {
            // jump to next untouched task
            if (state.taskList[i].isNew()) {
                if (i === 0) {
                    state.currentTaskIndex = false
                } else {
                    state.currentTaskIndex = i - 1
                }
                window.dispatchEvent(new CustomEvent('bunch-request-next-task'))
                break
            }
        }
        if (i === state.taskList.length) {
            window.dispatchEvent(new CustomEvent('bunch-request-submit'))
            return
        }
        solutionGuide.start(state.currentTaskIndex)
    })

    window.addEventListener('bunch-request-submit', (e) => {
        solutionGuide.stop()
        autoTask.stop()

        if (state.getTask() && !state.getTask().isSolved && !state.getTask().wasTimedOut) {
            state.taskList[state.currentTaskIndex].wasSkipped = true
        }

        state.isFinished = true
        state.endTime = performance.now()
        window.dispatchEvent(new CustomEvent('bunch-action-submit', { detail: { state: state } }))
    })

    window.addEventListener('bunch-request-next-task', function(e) {
        if (state.taskList.length == 0) {
            appSystem.log("SKIP: task list empty")
            return
        } else if (!state.currentTaskIndex && state.currentTaskIndex !== 0) {
            // new bunch was created, so start with first task
            state.currentTaskIndex = 0
        } else if (state.currentTaskIndex + 1 == state.taskList.length) {
            appSystem.log("SKIP: there is no next task")
            window.dispatchEvent(new CustomEvent('bunch-request-submit'))
                // window.dispatchEvent(new CustomEvent('bunch-request-new'))
            return
        } else {
            // display next task
            if (!state.getTask().isSolved && !state.getTask().wasTimedOut) {
                state.taskList[state.currentTaskIndex].wasSkipped = true
            }
            state.currentTaskIndex++
        }

        if (!state.isRunning && state.getTask().isNew()) {
            window.dispatchEvent(new CustomEvent('bunch-request-runner-start'))
        } else {
            solutionGuide.start(state.currentTaskIndex)
        }

        autoTask.stop()
        if (!state.getTask().startTime) {
            state.taskList[state.currentTaskIndex].startTime = performance.now()
        }

        window.dispatchEvent(new CustomEvent('bunch-action-task-next', { detail: { state: state } }))
    })

    window.addEventListener('bunch-request-previous-task', function(e) {
        if (!state.currentTaskIndex || state.currentTaskIndex == 0) {
            appSystem.log("SKIP: there is no previous-task")
            return
        } else {
            // display previous task
            if (!state.getTask().isSolved) {
                state.taskList[state.currentTaskIndex].wasSkipped = true
            }
            state.currentTaskIndex--
        }

        if (state.isRunning && !state.getTask().isNew()) {
            window.dispatchEvent(new CustomEvent('bunch-request-runner-pause'))
        } else {
            solutionGuide.start(state.currentTaskIndex)
        }

        autoTask.stop()

        window.dispatchEvent(new CustomEvent('bunch-action-task-previous', { detail: { state: state } }))
    })

    window.addEventListener('bunch-request-new', function(e) {
        state = BunchFactory.create()

        window.dispatchEvent(new CustomEvent('bunch-action-new', { detail: { state: state } }))
    })

    window.addEventListener('bunch-request-possible-solution-input', function(e) {
        if (state.isFinished) {
            appSystem.log("SKIP: you can not change a finished bunch")
            return
        }

        if (e.detail.taskIndex != state.currentTaskIndex) {
            appSystem.log("SKIP: you can only solve the current task")
            return
        }

        if (state.getTask().isSolved) {
            appSystem.log("SKIP: task is already solved")
            return
        }

        if (state.getTask(e.detail.taskIndex).isValidSolution(e.detail.input)) {
            if (state.getTask().answers[state.getTask().answers.length - 1] == e.detail.input) {
                appSystem.log("SKIP: answer is a doublicate")
                return
            }
            window.dispatchEvent(new CustomEvent('bunch-request-solution-input', {
                detail: e.detail
            }))
        }
    })

    window.addEventListener('bunch-request-solution-input', function(e) {
        if (state.isFinished) {
            appSystem.log("SKIP: you can not change a finished bunch")
            return
        }
        if (e.detail.taskIndex != state.currentTaskIndex) {
            appSystem.log("SKIP: you can only solve the current task")
            return
        }
        if (!e.detail.hasOwnProperty("input") || !e.detail.input || e.detail.input == "") {
            appSystem.log("SKIP: input missing")
            return
        }
        if (state.getTask().isSolved) {
            appSystem.log("SKIP: task is already solved")
            return
        }

        if (state.getTask().isValidSolution(e.detail.input, true)) {
            state.taskList[state.currentTaskIndex].endTime = performance.now()
            state.taskList[state.currentTaskIndex].isSolved = true

            window.dispatchEvent(new CustomEvent('bunch-action-solution-found', { detail: { state: state } }))
            solutionGuide.stop()

            if (state.currentTaskIndex === state.taskList.length - 1) {
                window.dispatchEvent(new CustomEvent('bunch-request-submit'))
                return
            }
            autoTask.start(state)
            return
        } else if (state.getTask(e.detail.taskIndex).isPartialSolution(e.detail.input)) {
            window.dispatchEvent(new CustomEvent('bunch-action-solution-partial-found', { detail: { state: state } }))
            return
        }
        window.dispatchEvent(new CustomEvent('bunch-action-solution-invalid', { detail: { state: state } }))
    })

    window.addEventListener('bunch-request-solution-timed-out', function(e) {
        if (e.detail.taskIndex != state.currentTaskIndex) {
            appSystem.log("SKIP: task is out of date")
            return
        }
        if (state.getTask(e.detail.taskIndex).endTime || state.getTask().isSolved) {
            appSystem.log("SKIP: task was already finished")
            return
        }
        if (state.getTask().wasTimedOut) {
            appSystem.log("SKIP: task was timed out")
            return
        }
        state.taskList[e.detail.taskIndex].endTime = performance.now()
        state.taskList[e.detail.taskIndex].wasTimedOut = true
        window.dispatchEvent(new CustomEvent('bunch-action-solution-timed-out', { detail: { state: state } }))
        solutionGuide.stop()
        if (state.currentTaskIndex === state.taskList.length - 1) {
            window.dispatchEvent(new CustomEvent('bunch-request-submit'))
            return
        }
        autoTask.start(state)
    })
}