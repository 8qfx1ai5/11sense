import * as appSystem from '../../main/system.js'
import * as Main from '../../main/main.js'

export let wasSolved = false
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
    appSystem.events.addEventListener('new-task-created', function(e) {
        updateView(e.detail.factor1, e.detail.factor2)
        resetInput()
        wasSolved = false
    })

    appSystem.events.addEventListener('solution-found', function(e) {
        wasSolved = true
        document.getElementById(tagIdSolutionInput).disabled = true
    })

    appSystem.events.addEventListener('solution-timed-out', function() {
        document.getElementById(tagIdSolutionInput).disabled = true
    })
}