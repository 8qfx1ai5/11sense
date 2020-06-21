import * as appSystem from '../../main/system.js'
import * as Main from '../../main/main.js'

let tagIdSolutionInput = 'solution'
let tagIdCurrentTaskArea = 'current-task'

function updateView(factor1, factor2) {
    document.getElementById(tagIdCurrentTaskArea).innerHTML = Main.formatNumberForDisplay(factor1) + " <span class='mainColor'>⋅</span> " + Main.formatNumberForDisplay(factor2)
}

function resetInput() {
    document.getElementById(tagIdSolutionInput).value = ""
    document.getElementById(tagIdSolutionInput).disabled = false
    document.getElementById(tagIdSolutionInput).focus()
    document.getElementById(tagIdSolutionInput).style.backgroundSize = "0%"
    document.getElementById(tagIdCurrentTaskArea).classList.remove("valid")
    document.getElementById(tagIdCurrentTaskArea).classList.remove("invalid")
    document.getElementById(tagIdSolutionInput).disabled = false
}

export function init() {
    window.addEventListener('bunch-action-task-next', function(e) {
        let currentTask = e.detail.state['taskList'][e.detail.state['currentTaskIndex']]
        updateView(currentTask.values[0], currentTask.values[1])
        resetInput()
    })

    appSystem.events.addEventListener('bunch-action-solution-found', function(e) {
        document.getElementById(tagIdSolutionInput).disabled = true
    })

    appSystem.events.addEventListener('bunch-action-solution-timed-out', function() {
        document.getElementById(tagIdSolutionInput).disabled = true
    })
}