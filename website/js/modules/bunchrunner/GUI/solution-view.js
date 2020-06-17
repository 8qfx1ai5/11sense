import * as appSystem from '../../main/system.js'
import * as Main from '../../main/main.js'
import * as appMath from '../../math/math.js'
import * as appSound from '../SUI/sound.js'
import * as appPage from '../../page/page.js'
import * as appRunner from '../bunchrunner.js'

let tagIdClipboard = "clipboard"
let localStorageKeySolutionGuideInterval = "solution-guide-interval"
let tagIdSolutionGuideInput = "solution-guide-selector"
let solutionGuideInterval = false
let tagIdSolutionTable = 'Solution'

let solutionGuideIntervalObject = false

let tagIdAutoTaskSelector = "auto-task-selector"
let localStorageAutoTaskInterval = "autoTaskInterval"
export let startTime = false
let endTime = false
let autoTaskStartTime = false
let autoTaskIntervalTime = false

function isSolutionGuideActive() {
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

function stopSolutionGuideLoop() {
    appSystem.log("stop solution guide loop", 1)
    if (solutionGuideIntervalObject) {
        clearTimeout(solutionGuideIntervalObject)
    }
    solutionGuideIntervalObject = false
}

function startNewSolutionGuideLoop() {
    stopSolutionGuideLoop()
    if (!isSolutionGuideActive()) {
        return
    }
    if (!appRunner.isRunning()) {
        return
    }
    let interval = getSolutionGuideInterval()
    appSystem.log("start new solution guide loop: '" + interval + "'", 2)
    solutionGuideIntervalObject = setTimeout(function() {
        appSystem.events.dispatchEvent(new CustomEvent('solution-timed-out'))
    }, interval)
}

export function isAutoTaskActive() {
    return startTime != false
}

function startAutoTask() {
    if (!appRunner.isRunning()) {
        stopAutoTask()
        return
    }
    let interval = getAutoTaskInterval()
    if (interval <= 0) {
        return
    }
    autoTaskStartTime = performance.now()
    window.requestAnimationFrame(autoTaskStep);
}

function autoTaskStep(timestamp) {
    if (!autoTaskStartTime) {
        return
    }
    const elapsed = timestamp - autoTaskStartTime;
    let interval = getAutoTaskInterval()
    Main.currentSolution.style.backgroundSize = ((elapsed) * 102 / interval) + "%"
    if (elapsed < interval || appSound.hasPendingSoundOutput()) { // Stop the animation after 2 seconds
        window.requestAnimationFrame(autoTaskStep);
    } else {
        appMath.newTask()
        stopAutoTask()
    }
}

function stopAutoTask() {
    autoTaskStartTime = false
}

function saveAutoTaskInterval() {
    let v = document.getElementById(tagIdAutoTaskSelector).value
    stopAutoTask()
    if (v == "∞") {
        localStorage.setItem(localStorageAutoTaskInterval, -1)
        autoTaskIntervalTime = -1
        return
    }
    localStorage.setItem(localStorageAutoTaskInterval, v * 1000)
    autoTaskIntervalTime = v * 1000
}

function getAutoTaskInterval() {
    if (!autoTaskIntervalTime) {
        let i = localStorage.getItem(localStorageAutoTaskInterval)
        if (!i || i == "") {
            saveAutoTaskInterval()
            i = localStorage.getItem(localStorageAutoTaskInterval)
        }
        autoTaskIntervalTime = i
    }

    return autoTaskIntervalTime
}

function updateViewSolution() {
    Main.currentTask.innerHTML = "<span class='mainColor'>" + Main.formatNumberForDisplay(appMath.factor1) + " ⋅ " + Main.formatNumberForDisplay(appMath.factor2) + " = </span> <span class='valid'>" + Main.formatNumberForDisplay(appMath.result) + " ✓</span>"
    Main.currentSolution.value = ""
    Main.currentSolution.placeholder = ""
    if (endTime) {
        Main.currentSolution.placeholder = ((endTime - startTime).toFixed(0) / 1000).toString() + " sec."
    }
}

function updateViewSolutionGuide() {
    Main.currentTask.innerHTML = "<span class='mainColor'>" + Main.formatNumberForDisplay(appMath.factor1) + " ⋅ " + Main.formatNumberForDisplay(appMath.factor2) + "</span> = <span class='mainColor'>" + Main.formatNumberForDisplay(appMath.result) + "</span>"
    Main.currentSolution.value = ""
    Main.currentSolution.placeholder = ""
}

// function creates and sets the content of the solution page for Pro mode
function updateSolutionPro() {
    let keys = Array.from(appMath.fractions.keys())
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
        currentSum = appMath.addDecimal(currentSum, appMath.fractions.get(keys[i]))
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
function updateSolution() {
    if (Main.isBeginnerModeActive()) {
        updateSolutionBeginner()
    } else {
        updateSolutionPro()
    }
}

function onDocumentReadyEvent() {

    window.addEventListener('bunch-action-start', () => {
        appMath.newTask()
    })

    window.addEventListener('bunch-action-pause', () => {
        stopSolutionGuideLoop()
        stopAutoTask()
    })

    appSystem.events.addEventListener('solution-timed-out', function() {
        stopSolutionGuideLoop()
        startAutoTask()
        endTime = performance.now()

        updateViewSolutionGuide()
        if (0 == getAutoTaskInterval()) {
            appMath.newTask()
        }
    })

    appSystem.events.addEventListener('solution-found', function(e) {
        stopSolutionGuideLoop()
        startAutoTask()
        endTime = performance.now()

        updateViewSolution()
        if (0 == getAutoTaskInterval()) {
            appMath.newTask()
        }
    })

    appSystem.events.addEventListener('partial-solution-found', function(e) {
        text = "<span style='color: green'>" + Main.formatNumberForDisplay(e.detail.input) + "</span> (" + e.detail.parts + ")"
        let entry = document.createElement('p')
        entry.innerHTML = text
        document.getElementById(tagIdClipboard).prepend(entry)
    })

    appSystem.events.addEventListener('no-solution-found', function(e) {
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

    appSystem.events.addEventListener('new-task-created', function(e) {
        document.getElementById(tagIdClipboard).innerHTML = ""
        startNewSolutionGuideLoop()
        updateSolution()
        stopAutoTask()
        startTime = performance.now()
        endTime = false
        document.getElementById(tagIdSolutionTable).style.display = "none"
    })

    document.getElementById(tagIdAutoTaskSelector).addEventListener('change', saveAutoTaskInterval)
    document.getElementById(tagIdSolutionGuideInput).addEventListener('change', saveSolutionGuideInterval)
    document.getElementById('solution').addEventListener('keyup', Main.guessInput)
}

function setDefaultValues() {
    let i = localStorage.getItem(localStorageAutoTaskInterval)
    if (i) {
        if (0 <= i) {
            document.getElementById(tagIdAutoTaskSelector).value = i / 1000
        } else {
            document.getElementById(tagIdAutoTaskSelector).value = "∞"
        }
        saveAutoTaskInterval()
    }

    let ii = localStorage.getItem(localStorageKeySolutionGuideInterval)
    if (ii == "false") {
        document.getElementById(tagIdSolutionGuideInput).value = "off"
    } else if (Number(ii)) {
        document.getElementById(tagIdSolutionGuideInput).value = ii / 1000
    }
    saveSolutionGuideInterval()
}

export function init() {
    onDocumentReadyEvent()
    setDefaultValues()
}