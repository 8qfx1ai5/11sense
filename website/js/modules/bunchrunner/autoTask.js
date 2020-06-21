let tagIdAutoTaskSelector = "auto-task-selector"
let localStorageAutoTaskInterval = "autoTaskInterval"

let autoTaskStartTime = false
let autoTaskIntervalTime = false

export function isAutoTaskRunning() {
    return startTime != false
}

export function startAutoTask() {
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
        window.dispatchEvent(new CustomEvent('bunch-request-next-task'))
        stopAutoTask()
    }
}

export function stopAutoTask() {
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

export function init() {

    document.getElementById(tagIdAutoTaskSelector).addEventListener('change', saveAutoTaskInterval)

    let i = localStorage.getItem(localStorageAutoTaskInterval)

    if (i) {
        if (0 <= i) {
            document.getElementById(tagIdAutoTaskSelector).value = i / 1000
        } else {
            document.getElementById(tagIdAutoTaskSelector).value = "∞"
        }
        saveAutoTaskInterval()
    }
}