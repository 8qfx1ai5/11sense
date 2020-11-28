import * as appSystem from '../../main/system.js'
import * as Main from '../../main/main.js'
import * as appMath from '../../math/math.js'
import * as appSound from '../SUI/sound.js'
import * as appPage from '../../page/page.js'
import * as appRunner from '../bunchRunner.js'

let tagIdClipboard = "clipboard"
let tagIdSolutionTable = 'Solution'

// function creates and sets the content of the solution page for Pro mode
function updateSolutionPro(task) {
    let keys = Array.from(task['possiblePartialAnswers'].keys())
    Main.psolutions.innerHTML = ""
    let f1s = task['values'][0]
    let f1 = parseFloat(f1s)
    let f2s = task['values'][1]
    let f2 = parseFloat(f2s)
    let rs = task['answer']
    let f = parseFloat(rs)
    let rSplit = rs.split(".")
    let rDecimals = appMath.getNumberOfDecimals(r)
    let f1Split = f1s.split(".")
    let f2Split = f2s.split(".")
    Main.SolutionTask.innerHTML = Main.formatNumberForDisplay(f1) + " ⋅ " + Main.formatNumberForDisplay(f2) + " = " + Main.formatNumberForDisplay(r)
    let currentSum = 0
    keys.sort(function(a, b) {
        let aSplit = a.split("⋅")
        let a1 = aSplit[0].length - 1
        if (aSplit[0].includes(".")) {
            a1 = (aSplit[0].length - 2) * -1
        }
        let a2 = aSplit[1].length - 1
        if (aSplit[1].includes(".")) {
            a2 = (aSplit[1].length - 2) * -1
        }
        let bSplit = b.split("⋅")
        let b1 = bSplit[0].length - 1
        if (bSplit[0].includes(".")) {
            b1 = (bSplit[0].length - 2) * -1
        }
        let b2 = bSplit[1].length - 1
        if (bSplit[1].includes(".")) {
            b2 = (bSplit[1].length - 2) * -1
        }

        return b1 + b2 - a1 - a2
    })
    for (let i = 0; i < keys.length; i++) {
        currentSum = appMath.addDecimal(currentSum, task['possiblePartialAnswers'].get(keys[i]))
        let factors = keys[i].split("⋅")
            //let x = currentSum * 100 / appMath.result
        Main.psolutions.innerHTML = Main.psolutions.innerHTML + (i + 1).toString().padStart(2) + ". " + formatNumberForMonoLength(factors[0], f1Split[0].length, appMath.factor1Decimals) + " ⋅ " + formatNumberForMonoLength(factors[1], f2Split[0].length, appMath.factor2Decimals) + " = " + formatNumberForMonoLength(appMath.fractions.get(keys[i]), rSplit[0].length, rDecimals) + " | " + formatNumberForMonoLength(currentSum, rSplit[0].length, rDecimals) + "<br />"
    }
}

function formatNumberForMonoLength(n, x, y) {
    let ns = n.toString()
    let nSplit = ns.split(".")
    let result = nSplit[0].padStart(x, " ")
    if (nSplit.length < 2) {
        nSplit[1] = "0"
    }
    if (0 < y) {
        result += "." + nSplit[1].padEnd(y, " ")
    }
    return result.replace(/[.]/g, ",")
}

// function creates and sets the content of the solution page for beginner mode
function updateSolutionBeginner() {
    Main.psolutions.innerHTML = ""
    let f1s = appMath.factor1.toString()
    let f2s = appMath.factor2.toString()
    let rs = appMath.result.toString()
    let rSplit = rs.split(".")
    let rDecimals = appMath.getNumberOfDecimals(appMath.result)
    let f1Split = f1s.split(".")
    let f2Split = f2s.split(".")
    Main.SolutionTask.innerHTML = Main.formatNumberForDisplay(appMath.factor1) + " ⋅ " + Main.formatNumberForDisplay(appMath.factor2) + " = " + Main.formatNumberForDisplay(appMath.result)
    let currentSum = 0
    let currentF1 = 0
    let iterations = parseInt(f1s.replace(".", ""), 10)
    let iterator = appMath.factor1 / iterations
    for (let i = 1; i <= iterations; i++) {
        currentF1 = appMath.multiplyDecimal(i, iterator)
        currentSum = appMath.multiplyDecimal(currentF1, appMath.factor2)
        Main.psolutions.innerHTML = Main.psolutions.innerHTML + formatNumberForMonoLength(currentF1, f1Split[0].length, appMath.factor1Decimals) + " ⋅ " + formatNumberForMonoLength(appMath.factor2, f2Split[0].length, appMath.factor2Decimals) + " = " + formatNumberForMonoLength(currentSum, rSplit[0].length, rDecimals) + "<br />"
    }
}

// function creates and sets the content of the solution page
function updateSolution(task) {
    // updateSolutionPro(task)
}

function onDocumentReadyEvent() {

    window.addEventListener('bunch-action-solution-partial-found', function(e) {
        let currentTask = e.detail.state.taskList[e.detail.state.currentTaskIndex]
        let lastAnswer = currentTask.answers[currentTask.answers.length - 1]
        let text = "<span style='color: green'>" + Main.formatNumberForDisplay(lastAnswer['input']) + "</span> (" + lastAnswer['analizationResult'] + ")"
        let entry = document.createElement('p')
        entry.innerHTML = text
        document.getElementById(tagIdClipboard).prepend(entry)
    })

    window.addEventListener('bunch-action-solution-invalid', function(e) {
        let solutionButton = document.createElement('span')
        solutionButton.classList.add('hint')
        solutionButton.addEventListener('click', appPage.toggleSolution)
        solutionButton.innerText = '?'
        let text = Main.formatNumberForDisplay(e.detail.input) + " "
        let entry = document.createElement('p')
        entry.innerHTML = text
        entry.append(solutionButton)
        document.getElementById(tagIdClipboard).prepend(entry)
    })

    window.addEventListener('bunch-action-task-next', function(e) {
        let currentTask = e.detail.state.taskList[e.detail.state.currentTaskIndex]
        document.getElementById(tagIdClipboard).innerHTML = ""
        updateSolution(currentTask)
        document.getElementById(tagIdSolutionTable).style.display = "none"
    })
}

export function init() {
    onDocumentReadyEvent()
}