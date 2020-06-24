import * as Main from '../../main/main.js'
import * as appSystem from '../../main/system.js'
import * as appSound from './sound.js'
import * as appNotification from '../../notification/onboarding.js'
import * as appTranslation from '../../language/translation.js'
import * as appMath from '../../math/math.js'
import * as autoTask from '../autoTask.js'

export let isActive = false
let isBetweenTasks = false
let recognitionObject = null
let recognitionKillTimout = false
let mediaStreamObject = null
let mobileSoundDetectionInterval = null

let isVoiceTechEndless = true
let voiceTechIsEndlessLocalStorageKey = "voice-tech"
let tagIdButtonVoiceTech = "button-voice-tech"

let tagIdButtonVoice = "button-voice"
    // let tagIdMicrophoneImage = "mic-image"

let lastInputs = []

function startRecognition() {
    if (!isActive) {
        appSystem.log("rc start omitted, voice not active", 1)
        return
    }
    if (isRecognitionRunning()) {
        appSystem.log("rc start omitted, already exists", 1)
        return
    }
    if (autoTask.isRunning() && isBetweenTasks) {
        appSystem.log("rc start omitted, between tasks", 1)
        return
    }
    if (appSound.hasPendingSoundOutput()) {
        appSystem.log("rc start omitted, has pending sound", 1)
        return
    }
    appNotification.sendMessageIfRequired("voiceScreenSaverConflictHint")

    if (isVoiceTechEndless) {
        startRecognitionEndless()
    } else {
        startRecognitionNoise()
    }
}

function startRecognitionEndless() {
    if (!isActive) {
        return
    }

    const speechRecognition = window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition || window.oSpeechRecognition || window.SpeechRecognition

    if (speechRecognition !== undefined) {

        if (typeof recognitionObject !== "object" || typeof recognitionObject === 'undefined' || recognitionObject === null) {
            recognitionObject = new speechRecognition()
            recognitionObject.continuous = true
            recognitionObject.interimResults = true
            recognitionObject.lang = appTranslation.getSelectedLanguage()
        }

        // recognitionObject.lang = "en-US"
        try { // calling it twice will throw...
            recognitionObject.start()
        } catch (e) {
            return
        }

        recognitionObject.onstart = function() {
            appSystem.log("start recognition endless")
            setStatusPlaceholder()
            lastInputs = []
            clearTimeout(recognitionKillTimout)
        }

        recognitionObject.onresult = recognitionOnResult

        recognitionObject.onerror = function(e) {
            // Main.currentSolution.placeholder = "🙉"
            clearTimeout(recognitionKillTimout)
            switch (e.error) {
                case "no-speech":
                case "aborted":
                    appSystem.log("dictation hint: " + e.error, 1)
                    stopRecognition()
                    break
                case "not-allowed":
                    if (!appPage.isDesktopMode()) {
                        appNotification.requireMessage("voiceScreenSaverConflictHint")
                    }
                case "audio-capture":
                case "network":
                case "service-not-allowed":
                case "bad-grammar":
                case "language-not-supported":
                default:
                    appSystem.log("dictation critical error: " + e.error, 3, "app")
                    appSystem.log(e, 3, "console")
                    abortRecognition()
                    break
            }
            recognitionObject = null
            lastInputs = []
        }

        recognitionObject.onend = function(e) {
            // Main.currentSolution.placeholder = "🙉"
            appSystem.log("dictation finished", 1)
            recognitionObject = null
            clearTimeout(recognitionKillTimout)
            startRecognition()
            lastInputs = []
        }

        recognitionObject.onaudioend = function(e) {
            // Main.currentSolution.placeholder = "🙉"
            appSystem.log("dictation audio ended", 1)
            recognitionObject = null
            clearTimeout(recognitionKillTimout)
                // stopRecognition()
            lastInputs = []
        }
    } else {
        alert("voice recognition is not supported in your browser")
    }
}

function startRecognitionNoise() {
    if (!isActive) {
        return
    }
    if (!mobileSoundDetectionInterval) {
        if (typeof mediaStreamObject !== "MediaStream") {
            if (!navigator.getUserMedia) {
                navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia
            }

            // request a LocalMediaStream
            if (navigator.getUserMedia) {
                navigator.getUserMedia({ audio: true },
                    function(stream) { mediaStreamObject = stream },
                    function(e) { appSystem.log(e.message) }
                )
            } else alert('getUserMedia not supported in this browser.')
        }

        mobileSoundDetectionInterval = setInterval(function() {
            if (!mediaStreamObject) {
                return
            }
            if (!isRecognitionRunning()) {
                // appSystem.log("try to find noise")
                // let silence_delay = 500
                // let min_decibels = -90
                let min_decibels = -99
                let max_decibels = -30
                const ctx = new(window.AudioContext || window.webkitAudioContext)()
                const analyser = ctx.createAnalyser()
                const streamNode = ctx.createMediaStreamSource(mediaStreamObject)
                streamNode.connect(analyser)
                    // analyser.connect(ctx.destination)
                analyser.minDecibels = min_decibels
                analyser.maxDecibels = max_decibels
                analyser.smoothingTimeConstant = 0
                analyser.fftSize = 256

                const data = new Uint8Array(analyser.frequencyBinCount); // create emtpy array
                // let silence_start = performance.now()
                // let triggered = false; // trigger only once per silence event

                analyser.getByteFrequencyData(data); // get current data
                appSystem.log(data)
                if (data.some(v => v)) { // if there is data above the given db limit
                    appSystem.log("noise found, start recognition")
                    handleRecognitionNoise()
                    clearInterval(mobileSoundDetectionInterval)
                        // silence_start = time; // set it to now
                }
                // detectSilence(mediaStreamObject, stopRecognition, )
            }
        }, 1000)
    }
}

function isRecognitionRunning() {
    return typeof recognitionObject == "object" && typeof recognitionObject !== 'undefined' && recognitionObject !== null
}

function handleRecognitionNoise() {
    recognitionObject = new webkitSpeechRecognition()
    recognitionObject.continuous = false
    recognitionObject.interimResults = true
    recognitionObject.lang = appTranslation.getSelectedLanguage()

    // recognitionObject.lang = "en-US"
    try { // calling it twice will throw...
        recognitionObject.start()
    } catch (e) {
        return
    }

    recognitionObject.onstart = function() {
        appSystem.log("start recognition noise")
        setStatusPlaceholder()
        lastInputs = []
    }

    recognitionObject.onresult = recognitionOnResult

    recognitionObject.onerror = function(e) {
        // Main.currentSolution.placeholder = "🙉"
        appSystem.log("uppps.. dictation interrupted", 1)
        stopRecognition()
        lastInputs = []
    }

    recognitionObject.onend = function(e) {
        // Main.currentSolution.placeholder = "🙉"
        appSystem.log("dictation finished", 1)
        recognitionObject = null
        lastInputs = []

        // startRecognition()
    }
}

function recognitionOnResult(e) {
    appSystem.log(e.results, 2, "console")
    if (!e.isTrusted) {
        return
    }
    if (!isActive) {
        appSystem.log("recognition inactive, abborting..")
        abortRecognition()
    } else {
        let currentResult = e.results[e.results.length - 1][0].transcript.trim()
        if (currentResult.length <= 10) {
            // Main.currentSolution.placeholder = currentResult
        } else {
            // Main.currentSolution.placeholder = currentResult.substring(0, 8) + ".."
        }

        if (currentResult == "stop") {
            appSystem.events.dispatchEvent(new CustomEvent('request-deactivate-conversation'))
            return
        }
        let detected = e.results[e.results.length - 1][0].transcript
        if (e.results[e.results.length - 1].isFinal) {
            let lang = appTranslation.getSelectedLanguage()
            let command = detected.trim().toLowerCase()
            if (lastInputs.includes(command)) {
                return
            }
            if (isCommandNewTask(lang, command)) {
                appSystem.events.dispatchEvent(new CustomEvent('create-new-task'))
                lastInputs.push(command)
                window.dispatchEvent(new CustomEvent('bunch-request-next-task'))
                return
            }
            if (isCommandRepeatTask(lang, command)) {
                lastInputs.push(command)
                appSystem.events.dispatchEvent(new CustomEvent('repeat-task'))
                return
            }
            if (isCommandAreYouThere(lang, command)) {
                lastInputs.push(command)
                appSystem.events.dispatchEvent(new CustomEvent('give-status-answer-yes'))
                return
            }
            if (isCommandHello(lang, command)) {
                lastInputs.push(command)
                appSystem.events.dispatchEvent(new CustomEvent('give-status-answer-hallo'))
                return
            }

            let foundNumber = guessFinalVoiceInput(detected)
            appSystem.log("final vr='" + detected + "' => '" + foundNumber + "'")
            if (foundNumber && !lastInputs.includes(foundNumber.toString())) {
                lastInputs.push(foundNumber.toString())
                    // Main.currentSolution.value = foundNumber
                window.dispatchEvent(new CustomEvent('bunch-request-solution-input', {
                    detail: {
                        input: foundNumber,
                        taskIndex: 0,
                    }
                }))
                setStatusPlaceholder()
                appSystem.log("ok.. dictation restart", 1)
                stopRecognition()
                return
            }
        } else {
            let input = detected.replace("Uhr", "")
            input = input.replace("/", " ")
            let inputTogether = input.replace(/ /g, "").replace(/[/]/g, "")
            let parts = input.split(" ")
            appSystem.log("vr='" + detected + "' => (t: '" + inputTogether + "' p: '" + parts.join("|") + "')")
            if (!lastInputs.includes(inputTogether) && guessVoiceInput(inputTogether)) {
                lastInputs.push(inputTogether)
                appSystem.log("ok.. dictation restart", 1)
                stopRecognition()
                return
            }
            for (let i = 0; i < parts.length; i++) {
                appSystem.log(parts[i], 1)
                if (!lastInputs.includes(parts[i]) && guessVoiceInput(parts[i])) {
                    lastInputs.push(parts[i])
                    appSystem.log("ok.. dictation restart", 1)
                    stopRecognition()
                    return
                }
                appSystem.log("invalid", 1)
            }
        }
    }
}

function isCommandNewTask(lang, input) {
    if (lang == "de-DE") {
        return ["neue aufgabe", "neu", "next", "weiter"].includes(input)
    }
    return ["new task", "new", "next", "continue"].includes(input)
}

function isCommandRepeatTask(lang, input) {
    if (lang == "de-DE") {
        return ["wiederhole", "wiederhole bitte", "bitte wiederhole", "bitte wiederholen", "kannst du das bitte wiederholen", "bitte wiederhole die aufgabe", "wiederholen", "noch mal", "bitte noch mal", "erneut", "erneut sagen", "wie bitte"].includes(input)
    }
    return ["repeat", "repeat please", "please repeat", "can you please repeat", "please repeat the task", "again", "please one more time", "what did you say"].includes(input)
}

function isCommandAreYouThere(lang, input) {
    if (lang == "de-DE") {
        return ["dorie", "dori", "bist du noch da"].includes(input)
    }
    return ["dorie", "dori", "are you there"].includes(input)
}

function isCommandHello(lang, input) {
    if (lang == "de-DE") {
        return ["hallo", "hi", "guten tag"].includes(input)
    }
    return ["hello", "hi", "good day"].includes(input)
}

function stopRecognition() {
    if (typeof recognitionObject == "object" && typeof recognitionObject !== 'undefined' && recognitionObject !== null) {
        recognitionObject.stop()
    }
}

function abortRecognition() {
    if (typeof recognitionObject == "object" && typeof recognitionObject !== 'undefined' && recognitionObject !== null) {
        recognitionObject.abort()
    }
}

function toggleVoiceMode() {
    if (isActive) {
        deactivateVoiceMode()
    } else {
        activateVoiceMode()
    }
}

export function activateVoiceMode() {
    deactivateVoiceMode(true)
    localStorage.setItem('isActive', true)
        // document.getElementById(tagIdMicrophoneImage).classList.remove("hidden")
    document.getElementById(tagIdButtonVoice + "-on").classList.remove("hidden")
    document.getElementById(tagIdButtonVoice + "-off").classList.add("hidden")
        // Main.currentSolution.setAttribute("readonly", "readonly")
    isActive = true
    startRecognition()
    appSystem.events.dispatchEvent(new CustomEvent('voice-mode-start-after'))
}

export function deactivateVoiceMode(isJustARestart = false) {
    stopRecognition()
    clearInterval(mobileSoundDetectionInterval)
    mobileSoundDetectionInterval = null
    if (!isJustARestart) {
        // document.getElementById(tagIdMicrophoneImage).classList.add("hidden")
        document.getElementById(tagIdButtonVoice + "-on").classList.add("hidden")
        document.getElementById(tagIdButtonVoice + "-off").classList.remove("hidden")
        isActive = false
        localStorage.setItem('isActive', false)
            // Main.currentSolution.removeAttribute("readonly")
        appSystem.events.dispatchEvent(new CustomEvent('voice-mode-end-after'))
    }
}

// TODO: unit tests
// "0, 366" => "0.366"
// "8 Uhr" => "8"
// "drei" => "3"
function guessFinalVoiceInput(s) {
    let tempInput = s.replace("Uhr", "").replace(",", ".").replace(/ /g, "")
    let c = parseFloat(tempInput)
    if (c) {
        return c
    }
    return false
}

function guessVoiceInput(s) {
    s = s.replace(",", ".")
    if (s.length != appMath.result.toString().length) {
        return false
    }
    let c = parseFloat(s)
    if (c == appMath.factor1 || c == appMath.factor2) {
        return false
    }
    if (c == appMath.result) {
        // Main.currentSolution.value = s
        window.dispatchEvent(new CustomEvent('bunch-request-possible-solution-input', {
            detail: {
                input: s,
            }
        }))
        setStatusPlaceholder()
        return true
    }
    return false
}

function setStatusPlaceholder() {
    if (isActive) {
        if (isRecognitionRunning()) {
            // Main.currentSolution.placeholder = "..."
            return
        }
        // Main.currentSolution.placeholder = "🙉"
        return
    }
    // Main.currentSolution.placeholder = "="
}

function toggleVoiceTech() {
    if (isVoiceTechEndless) {
        setVoiceTechNoise()
    } else {
        setVoiceTechEndless()
    }
}

function setVoiceTechEndless() {
    isVoiceTechEndless = true
    localStorage.setItem(voiceTechIsEndlessLocalStorageKey, true)
    document.getElementById(tagIdButtonVoiceTech + "-endless").classList.remove("hidden")
    document.getElementById(tagIdButtonVoiceTech + "-noise").classList.add("hidden")
    deactivateVoiceMode()
}

function setVoiceTechNoise() {
    isVoiceTechEndless = false
    localStorage.setItem(voiceTechIsEndlessLocalStorageKey, false)
    document.getElementById(tagIdButtonVoiceTech + "-endless").classList.add("hidden")
    document.getElementById(tagIdButtonVoiceTech + "-noise").classList.remove("hidden")
    deactivateVoiceMode()
}

export function init() {

    window.addEventListener('bunch-action-solution-found', function(e) {
        // workaround to omit mobile beeps as mutch as possible
        isBetweenTasks = true
    })

    window.addEventListener('bunch-action-solution-timed-out', function(e) {
        // workaround to omit mobile beeps as mutch as possible
        isBetweenTasks = true
        stopRecognition()
    })

    window.addEventListener('bunch-action-task-next', function() {
        isBetweenTasks = false
        if (isActive) {
            setTimeout(function() {
                startRecognition()
            }, 100)
        }
        setStatusPlaceholder()
    })

    document.getElementById(tagIdButtonVoiceTech).addEventListener('click', function(e) {
        toggleVoiceTech()
    })

    window.addEventListener('speak-before', function(e) {
        if (isActive) {
            abortRecognition()
        }
        setStatusPlaceholder()
    })

    window.addEventListener('speak-after', function(e) {
        if (isActive) {
            setTimeout(function() {
                startRecognition()
            }, 100)
        }
        setStatusPlaceholder()
    })

    document.getElementById(tagIdButtonVoice).addEventListener('click', toggleVoiceMode)
        // document.getElementById('solution').addEventListener('click', startRecognition)

    // if (localStorage.getItem(voiceTechIsEndlessLocalStorageKey)) {
    //     isVoiceTechEndless = !localStorage.getItem(voiceTechIsEndlessLocalStorageKey)
    // } else {
    //     isVoiceTechEndless = !appPage.isDesktopMode()
    // }
    isVoiceTechEndless = false
    toggleVoiceTech()
}