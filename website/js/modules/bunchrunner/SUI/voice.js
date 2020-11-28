import * as appSystem from '../../main/system.js'
import * as appSound from './sound.js'
import * as appNotification from '../../notification/onboarding.js'
import * as appTranslation from '../../language/translation.js'
import * as autoTask from '../autoTask.js'
import * as appRunner from '../bunchRunner.js'

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

let bunchStateCurrentTaskIndex = false
let bunchStateCurrentTask = false
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
        }

        recognitionObject.onend = function(e) {
            // Main.currentSolution.placeholder = "🙉"
            appSystem.log("dictation finished", 1)
            recognitionObject = null
            clearTimeout(recognitionKillTimout)
            startRecognition()
        }

        recognitionObject.onaudioend = function(e) {
            // Main.currentSolution.placeholder = "🙉"
            appSystem.log("dictation audio ended", 1)
            recognitionObject = null
            clearTimeout(recognitionKillTimout)
                // stopRecognition()
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
    }

    recognitionObject.onresult = recognitionOnResult

    recognitionObject.onerror = function(e) {
        // Main.currentSolution.placeholder = "🙉"
        appSystem.log("uppps.. dictation interrupted", 1)
        stopRecognition()
    }

    recognitionObject.onend = function(e) {
        // Main.currentSolution.placeholder = "🙉"
        appSystem.log("dictation finished", 1)
        recognitionObject = null
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
            appSystem.log("vr command: '" + command + "'")
            if (lastInputs.includes(command)) {
                appSystem.log("vr command skipped: '" + command + "'")
                return
            }
            if (isCommandNextTask(lang, command)) {
                lastInputs.push(command)
                window.dispatchEvent(new CustomEvent('bunch-request-next-task'))
                return
            }
            if (isCommandRestart(lang, command)) {
                lastInputs.push(command)
                window.dispatchEvent(new CustomEvent('bunch-request-new'))
                return
            }
            if (isCommandPreviousTask(lang, command)) {
                lastInputs.push(command)
                window.dispatchEvent(new CustomEvent('bunch-request-previous-task'))
                return
            }
            if (isCommandStart(lang, command)) {
                lastInputs.push(command)
                window.dispatchEvent(new CustomEvent('bunch-request-runner-start'))
                return
            }
            if (isCommandPause(lang, command)) {
                lastInputs.push(command)
                window.dispatchEvent(new CustomEvent('bunch-request-runner-pause'))
                return
            }
            if (isCommandStop(lang, command)) {
                lastInputs.push(command)
                window.dispatchEvent(new CustomEvent('bunch-request-new'))
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
            appSystem.log(lastInputs, 1, "console")
            if (foundNumber && !lastInputs.includes(foundNumber)) {
                lastInputs.push(foundNumber)
                    // Main.currentSolution.value = foundNumber
                window.dispatchEvent(new CustomEvent('bunch-request-solution-input', {
                    detail: {
                        input: foundNumber,
                        taskIndex: bunchStateCurrentTaskIndex,
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
            let inputTogetherGuessed = guessVoiceInput(inputTogether)
            if (!lastInputs.includes(inputTogetherGuessed) && inputTogetherGuessed) {
                // lastInputs.push(inputTogetherGuessed)
                window.dispatchEvent(new CustomEvent('bunch-request-possible-solution-input', {
                    detail: {
                        input: inputTogetherGuessed,
                        taskIndex: bunchStateCurrentTaskIndex,
                    }
                }))
                appSystem.log("ok.. dictation restart", 1)
                stopRecognition()
                return
            }
            for (let i = 0; i < parts.length; i++) {
                appSystem.log(parts[i], 1)
                let inputPart = guessVoiceInput(parts[i])
                if (!lastInputs.includes(inputPart) && inputPart) {
                    // lastInputs.push(inputPart)
                    window.dispatchEvent(new CustomEvent('bunch-request-possible-solution-input', {
                        detail: {
                            input: inputPart,
                            taskIndex: bunchStateCurrentTaskIndex,
                        }
                    }))

                    appSystem.log("ok.. dictation restart", 1)
                    stopRecognition()
                    return
                }
                appSystem.log("invalid", 1)
            }
        }
    }
}

function isCommandNextTask(lang, input) {
    if (lang == "de-DE") {
        return ["neue aufgabe", "next", "weiter", "nächste"].includes(input)
    }
    return ["new task", "new", "next", "continue"].includes(input)
}

function isCommandPreviousTask(lang, input) {
    if (lang == "de-DE") {
        return ["letzte aufgabe", "letzte", "zurück"].includes(input)
    }
    return ["last task", "last", "back"].includes(input)
}

function isCommandRestart(lang, input) {
    if (lang == "de-DE") {
        return ["neue runde", "neue übung", "noch eine runde"].includes(input)
    }
    return ["restart", "again", "new round", "new exercise"].includes(input)
}

function isCommandStart(lang, input) {
    if (lang == "de-DE") {
        return ["starten", "start", "anfangen", "los"].includes(input)
    }
    return ["play", "start", "new round", "new exercise"].includes(input)
}

function isCommandPause(lang, input) {
    if (lang == "de-DE") {
        return ["pause", "pausieren", "warte", "warten", "halt", "moment", "stop"].includes(input)
    }
    return ["pause", "hold on", "wait", "stop"].includes(input)
}

function isCommandStop(lang, input) {
    if (lang == "de-DE") {
        return ["abbrechen", "übung abbrechen", "übung stoppen"].includes(input)
    }
    return ["abbort", "abbort exercise"].includes(input)
}

function isCommandRepeatTask(lang, input) {
    if (lang == "de-DE") {
        return ["wiederhole", "wiederhole bitte", "bitte wiederhole", "bitte wiederholen", "kannst du das bitte wiederholen", "bitte wiederhole die aufgabe", "wiederholen", "noch mal", "bitte noch mal", "erneut", "erneut sagen", "wie bitte"].includes(input)
    }
    return ["repeat", "repeat please", "please repeat", "can you please repeat", "please repeat the task", "again", "please one more time", "what did you say"].includes(input)
}

function isCommandAreYouThere(lang, input) {
    if (lang == "de-DE") {
        return ["bist du noch da"].includes(input)
    }
    return ["are you there"].includes(input)
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
    s = mapStringToNumber(s)
    s = s.replace(",", ".")
    if (!bunchStateCurrentTask) {
        return false
    }
    let c = parseFloat(s)
    if (!c) {
        return false
    }
    if (c == bunchStateCurrentTask.values[0] || c == bunchStateCurrentTask.values[1]) {
        return false
    }
    return c
}

function mapStringToNumber(s) {
    switch (s) {
        case 'eins':
            return "1"
        case 'zwei':
            return "2"
        case 'drei':
            return "3"
        case 'vier':
            return "4"
        case 'fünf':
            return "5"
        case 'sechs':
            return "6"
        case 'sieben':
            return "7"
        case 'acht':
            return "8"
        case 'neun':
            return "9"
        default:
            return s
    }
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
        stopRecognition()
    })

    window.addEventListener('bunch-action-solution-timed-out', function(e) {
        // workaround to omit mobile beeps as mutch as possible
        stopRecognition()
    })

    window.addEventListener('bunch-action-task-next', function() {
        if (isActive) {
            if (!appSound.isActive) {
                startRecognition()
            }
            lastInputs = []
        }
    })

    window.addEventListener('bunch-action-task-previous', function() {
        if (isActive) {
            if (!appSound.isActive) {
                startRecognition()
            }
            lastInputs = []
        }
    })

    window.addEventListener('bunch-action-new', function() {
        if (isActive) {
            lastInputs = []
        }
    })

    document.getElementById(tagIdButtonVoiceTech).addEventListener('click', function(e) {
        toggleVoiceTech()
    })

    appSystem.events.addEventListener('speak-before', function(e) {
        if (isActive) {
            abortRecognition()
        }
        setStatusPlaceholder()
    })

    appSystem.events.addEventListener('speak-after', function(e) {
        if (isActive) {
            setTimeout(function() {
                startRecognition()
            }, 100)
        }
        setStatusPlaceholder()
    })

    appRunner.events.forEach((event) => {
        window.addEventListener(event, function(e) {
            let state = e.detail.state
            bunchStateCurrentTaskIndex = state.currentTaskIndex
            bunchStateCurrentTask = state.getTask()
        })
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