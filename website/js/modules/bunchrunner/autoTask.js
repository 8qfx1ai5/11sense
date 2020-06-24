import * as appSound from './SUI/sound.js'

let tagIdAutoTaskSelector = "auto-task-selector"
let localStorageAutoTaskInterval = "autoTaskInterval"

let autoTaskStartTime = false
let autoTaskIntervalTime = false

export function isRunning() {
    return autoTaskStartTime != false
}

export function start() {
    if (!isEnabled()) {
        return
    }
    if (isRunning()) {
        stop()
    }
    autoTaskStartTime = performance.now()
    window.requestAnimationFrame(autoTaskStep);
}

export function isEnabled() {
    return getAutoTaskInterval() > 0
}

function autoTaskStep(timestamp) {
    if (!autoTaskStartTime) {
        return
    }
    const elapsed = timestamp - autoTaskStartTime;
    let interval = getAutoTaskInterval()
        // TODO: implement own component
        // document.getElementById('solution').style.backgroundSize = ((elapsed) * 102 / interval) + "%"
    if (elapsed < interval || appSound.hasPendingSoundOutput()) { // Stop the animation after 2 seconds
        window.requestAnimationFrame(autoTaskStep);
    } else {
        window.dispatchEvent(new CustomEvent('bunch-request-next-task'))
        stop()
    }
}

export function stop() {
    autoTaskStartTime = false
}

function saveAutoTaskInterval() {
    let v = document.getElementById(tagIdAutoTaskSelector).value
    stop()
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