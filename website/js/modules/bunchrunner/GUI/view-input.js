let tagIdSolutionInput = 'solution'

function resetInput() {
    document.getElementById(tagIdSolutionInput).value = ""
    document.getElementById(tagIdSolutionInput).disabled = false
    document.getElementById(tagIdSolutionInput).focus()
    document.getElementById(tagIdSolutionInput).style.backgroundSize = "0%"
    document.getElementById(tagIdSolutionInput).disabled = false
}

export function init() {
    window.addEventListener('bunch-action-task-next', function(e) {
        resetInput()
    })

    window.addEventListener('bunch-action-task-previous', function(e) {
        resetInput()
    })

    window.addEventListener('bunch-action-solution-found', function(e) {
        document.getElementById(tagIdSolutionInput).disabled = true
    })

    window.addEventListener('bunch-action-solution-timed-out', function() {
        document.getElementById(tagIdSolutionInput).disabled = true
    })

    window.addEventListener('bunch-action-solution-partial-found', function() {
        resetInput()
    })
}