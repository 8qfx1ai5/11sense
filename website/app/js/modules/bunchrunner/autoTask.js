import * as appSound from './SUI/sound.js'

let localStorageAutoTaskInterval = "breakTimeout"

let autoTaskStartTime = false

/** @var currentAutoTaskInterval cached value used in the wait loop, to omit local storage access */
let currentAutoTaskInterval = -1

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
    return getAutoTaskInterval() >= 0
}

function autoTaskStep(timestamp) {
    if (!autoTaskStartTime) {
        return
    }
    const elapsed = timestamp - autoTaskStartTime;
    let interval = currentAutoTaskInterval
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

function getAutoTaskInterval() {
    let interval = localStorage.getItem(localStorageAutoTaskInterval)
    if (!interval || interval == "∞" || interval == "") {
        currentAutoTaskInterval = -1
        return currentAutoTaskInterval
    }
    currentAutoTaskInterval = interval * 1000
    return currentAutoTaskInterval
}