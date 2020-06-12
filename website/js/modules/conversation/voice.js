import * as Main from '../main/main.js';
import * as appSystem from '../main/system.js'
import { appSolution } from '../task/solution-view.js'
import * as appSound from '../conversation/sound.js'
import { appNotification } from '../notification/onboarding.js'
import * as appTranslation from '../language/translation.js'
import * as appMath from '../math/math.js'
import { appTask } from '../task/task-view.js'

export let appVoice = {

    isActive: false,
    isBetweenTasks: false,
    recognitionObject: null,
    recognitionKillTimout: false,
    mediaStreamObject: null,
    mobileSoundDetectionInterval: null,

    isVoiceTechEndless: true,
    voiceTechLocalStorageKey: "voice-tech",
    tagIdButtonVoiceTech: "button-voice-tech",

    tagIdButtonVoice: "button-voice",
    tagIdMicrophoneImage: "mic-image",

    wasMaybeInterruptedByScreenSaver: false,

    lastInputs: [],

    startRecognition: function() {
        if (!appVoice.isActive) {
            appSystem.log("rc start omitted, voice not active", 1);
            return;
        }
        if (appVoice.isRecognitionRunning()) {
            appSystem.log("rc start omitted, already exists", 1);
            return;
        }
        if (appSolution.isAutoTaskActive() && appVoice.isBetweenTasks) {
            appSystem.log("rc start omitted, between tasks", 1);
            return;
        }
        if (appSound.hasPendingSoundOutput()) {
            appSystem.log("rc start omitted, has pending sound", 1);
            return;
        }
        appNotification.sendMessageIfRequired("voiceScreenSaverConflictHint");

        if (appVoice.isVoiceTechEndless) {
            appVoice.startRecognitionEndless();
        } else {
            appVoice.startRecognitionNoise();
        }
    },

    startRecognitionEndless: function() {
        if (!appVoice.isActive) {
            return;
        }

        const speechRecognition = window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition || window.oSpeechRecognition || window.SpeechRecognition;

        if (speechRecognition !== undefined) {

            if (typeof appVoice.recognitionObject !== "object" || typeof appVoice.recognitionObject === 'undefined' || appVoice.recognitionObject === null) {
                appVoice.recognitionObject = new speechRecognition();
                appVoice.recognitionObject.continuous = true;
                appVoice.recognitionObject.interimResults = true;
                appVoice.recognitionObject.lang = appTranslation.getSelectedLanguage();
            }

            // appVoice.recognitionObject.lang = "en-US";
            try { // calling it twice will throw...
                appVoice.recognitionObject.start();
            } catch (e) {
                return;
            }

            appVoice.recognitionObject.onstart = function() {
                appSystem.log("start recognition endless");
                appVoice.setStatusPlaceholder();
                appVoice.lastInputs = [];
                clearTimeout(appVoice.recognitionKillTimout)
                    // appVoice.recognitionKillTimout = setInterval(function() {
                    // speechSynthesis.speak(new SpeechSynthesisUtterance("w"));
                    // appSystem.log("dictation fake events")
                    // }, 3000)
            }

            // appVoice.recognitionObject.onsoundstart = function() {
            //     appSystem.log("vr on sound start", 1);
            // }

            // appVoice.recognitionObject.onspeechstart = function(e) {
            //     appSystem.log("vr on speech start", 1);
            // }

            // appVoice.recognitionObject.onspeechend = function(e) {
            //     appSystem.log("vr on speech end", 1);
            //     appSystem.log(e, 1, "console");
            // }

            appVoice.recognitionObject.onresult = appVoice.recognitionOResult;

            appVoice.recognitionObject.onerror = function(e) {
                Main.currentSolution.placeholder = "🙉";
                clearTimeout(appVoice.recognitionKillTimout)
                switch (e.error) {
                    case "no-speech":
                    case "aborted":
                        appSystem.log("dictation hint: " + e.error, 1);
                        appVoice.stopRecognition();
                        break;
                    case "not-allowed":
                        if (!appPage.isDesktopMode()) {
                            appNotification.requireMessage("voiceScreenSaverConflictHint");
                        }
                    case "audio-capture":
                    case "network":
                    case "service-not-allowed":
                    case "bad-grammar":
                    case "language-not-supported":
                    default:
                        appSystem.log("dictation critical error: " + e.error, 3, "app")
                        appSystem.log(e, 3, "console");
                        appVoice.abortRecognition();
                        break;
                }
                appVoice.recognitionObject = null;
                appVoice.lastInputs = [];
            }

            appVoice.recognitionObject.onend = function(e) {
                Main.currentSolution.placeholder = "🙉";
                appSystem.log("dictation finished", 1);
                appVoice.recognitionObject = null;
                clearTimeout(appVoice.recognitionKillTimout)
                appVoice.startRecognition();
                appVoice.lastInputs = [];
            }

            appVoice.recognitionObject.onaudioend = function(e) {
                Main.currentSolution.placeholder = "🙉";
                appSystem.log("dictation audio ended", 1);
                appVoice.recognitionObject = null;
                clearTimeout(appVoice.recognitionKillTimout)
                    // appVoice.stopRecognition();
                appVoice.lastInputs = [];
            }
        } else {
            alert("voice recognition is not supported in your browser");
        }
    },

    startRecognitionNoise: function() {
        if (!appVoice.isActive) {
            return;
        }
        if (!appVoice.mobileSoundDetectionInterval) {
            if (typeof appVoice.mediaStreamObject !== "MediaStream") {
                if (!navigator.getUserMedia) {
                    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
                }

                // request a LocalMediaStream
                if (navigator.getUserMedia) {
                    navigator.getUserMedia({ audio: true },
                        function(stream) { appVoice.mediaStreamObject = stream },
                        function(e) { appSystem.log(e.message) }
                    );
                } else alert('getUserMedia not supported in this browser.');
            }

            appVoice.mobileSoundDetectionInterval = setInterval(function() {
                if (!appVoice.mediaStreamObject) {
                    return;
                }
                if (!appVoice.isRecognitionRunning()) {
                    // appSystem.log("try to find noise");
                    // let silence_delay = 500;
                    // let min_decibels = -90;
                    let min_decibels = -99;
                    let max_decibels = -30;
                    const ctx = new(window.AudioContext || window.webkitAudioContext)();
                    const analyser = ctx.createAnalyser();
                    const streamNode = ctx.createMediaStreamSource(appVoice.mediaStreamObject);
                    streamNode.connect(analyser);
                    // analyser.connect(ctx.destination);
                    analyser.minDecibels = min_decibels;
                    analyser.maxDecibels = max_decibels;
                    analyser.smoothingTimeConstant = 0;
                    analyser.fftSize = 256;

                    const data = new Uint8Array(analyser.frequencyBinCount); // create emtpy array
                    // let silence_start = performance.now();
                    // let triggered = false; // trigger only once per silence event

                    analyser.getByteFrequencyData(data); // get current data
                    appSystem.log(data);
                    if (data.some(v => v)) { // if there is data above the given db limit
                        appSystem.log("noise found, start recognition");
                        appVoice.handleRecognitionNoise();
                        clearInterval(appVoice.mobileSoundDetectionInterval);
                        // silence_start = time; // set it to now
                    }
                    // appVoice.detectSilence(appVoice.mediaStreamObject, appVoice.stopRecognition, )
                }
            }, 1000);
        }
    },

    isRecognitionRunning: function() {
        return typeof appVoice.recognitionObject == "object" && typeof appVoice.recognitionObject !== 'undefined' && appVoice.recognitionObject !== null;
    },

    handleRecognitionNoise: function() {
        appVoice.recognitionObject = new webkitSpeechRecognition();
        appVoice.recognitionObject.continuous = false;
        appVoice.recognitionObject.interimResults = true;
        appVoice.recognitionObject.lang = appTranslation.getSelectedLanguage();

        // appVoice.recognitionObject.lang = "en-US";
        try { // calling it twice will throw...
            appVoice.recognitionObject.start();
        } catch (e) {
            return;
        }

        appVoice.recognitionObject.onstart = function() {
            appSystem.log("start recognition noise");
            appVoice.setStatusPlaceholder();
            appVoice.lastInputs = [];
        }

        appVoice.recognitionObject.onresult = appVoice.recognitionOResult;

        appVoice.recognitionObject.onerror = function(e) {
            Main.currentSolution.placeholder = "🙉";
            appSystem.log("uppps.. dictation interrupted", 1);
            appVoice.stopRecognition();
            appVoice.lastInputs = [];
        }

        appVoice.recognitionObject.onend = function(e) {
            Main.currentSolution.placeholder = "🙉";
            appSystem.log("dictation finished", 1);
            appVoice.recognitionObject = null;
            appVoice.lastInputs = [];

            // appVoice.startRecognition();
        }
    },

    recognitionOResult: function(e) {
        appSystem.log(e.results, 2, "console");
        if (!e.isTrusted) {
            return;
        }
        if (!appVoice.isActive) {
            appSystem.log("recognition inactive, abborting..");
            appVoice.abortRecognition();
        } else {
            let currentResult = e.results[e.results.length - 1][0].transcript.trim();
            if (currentResult.length <= 10) {
                Main.currentSolution.placeholder = currentResult;
            } else {
                Main.currentSolution.placeholder = currentResult.substring(0, 8) + "..";
            }

            if (currentResult == "stop") {
                appSystem.events.dispatchEvent(new CustomEvent('request-deactivate-conversation'));
                return;
            }
            let detected = e.results[e.results.length - 1][0].transcript;
            if (e.results[e.results.length - 1].isFinal) {
                let lang = appTranslation.getSelectedLanguage()
                let command = detected.trim().toLowerCase();
                if (appVoice.lastInputs.includes(command)) {
                    return;
                }
                if (appVoice.isCommandNewTask(lang, command)) {
                    appSystem.events.dispatchEvent(new CustomEvent('create-new-task'));
                    appVoice.lastInputs.push(command)
                    appMath.newTask(false);
                    return;
                }
                if (appVoice.isCommandRepeatTask(lang, command)) {
                    appVoice.lastInputs.push(command)
                    appSystem.events.dispatchEvent(new CustomEvent('repeat-task'));
                    return;
                }
                if (appVoice.isCommandAreYouThere(lang, command)) {
                    appVoice.lastInputs.push(command)
                    appSystem.events.dispatchEvent(new CustomEvent('give-status-answer-yes'));
                    return;
                }
                if (appVoice.isCommandHello(lang, command)) {
                    appVoice.lastInputs.push(command)
                    appSystem.events.dispatchEvent(new CustomEvent('give-status-answer-hallo'));
                    return;
                }
                if (!appTask.wasSolved) {
                    let foundNumber = appVoice.guessFinalVoiceInput(detected);
                    appSystem.log("final vr='" + detected + "' => '" + foundNumber + "'");
                    if (foundNumber && !appVoice.lastInputs.includes(foundNumber.toString())) {
                        appVoice.lastInputs.push(foundNumber.toString());
                        Main.currentSolution.value = foundNumber;
                        Main.processInput();
                        appVoice.setStatusPlaceholder()
                        appSystem.log("ok.. dictation restart", 1);
                        appVoice.stopRecognition();
                        return;
                    }
                }
            } else {
                let input = detected.replace("Uhr", "");
                input = input.replace("/", " ");
                let inputTogether = input.replace(/ /g, "").replace(/[/]/g, "");
                let parts = input.split(" ");
                appSystem.log("vr='" + detected + "' => (t: '" + inputTogether + "' p: '" + parts.join("|") + "')");
                if (!appVoice.lastInputs.includes(inputTogether) && appVoice.guessVoiceInput(inputTogether)) {
                    appVoice.lastInputs.push(inputTogether);
                    appSystem.log("ok.. dictation restart", 1);
                    appVoice.stopRecognition();
                    return;
                }
                for (let i = 0; i < parts.length; i++) {
                    appSystem.log(parts[i], 1);
                    if (!appVoice.lastInputs.includes(parts[i]) && appVoice.guessVoiceInput(parts[i])) {
                        appVoice.lastInputs.push(parts[i]);
                        appSystem.log("ok.. dictation restart", 1);
                        appVoice.stopRecognition();
                        return;
                    }
                    appSystem.log("invalid", 1);
                }
            }
        }
    },

    isCommandNewTask(lang, input) {
        if (lang == "de-DE") {
            return ["neue aufgabe", "neu", "next", "weiter"].includes(input)
        }
        return ["new task", "new", "next", "continue"].includes(input)
    },

    isCommandRepeatTask(lang, input) {
        if (lang == "de-DE") {
            return ["wiederhole", "wiederhole bitte", "bitte wiederhole", "bitte wiederholen", "kannst du das bitte wiederholen", "bitte wiederhole die aufgabe", "wiederholen", "noch mal", "bitte noch mal", "erneut", "erneut sagen", "wie bitte"].includes(input)
        }
        return ["repeat", "repeat please", "please repeat", "can you please repeat", "please repeat the task", "again", "please one more time", "what did you say"].includes(input)
    },

    isCommandAreYouThere(lang, input) {
        if (lang == "de-DE") {
            return ["dorie", "dori", "bist du noch da"].includes(input)
        }
        return ["dorie", "dori", "are you there"].includes(input)
    },

    isCommandHello(lang, input) {
        if (lang == "de-DE") {
            return ["hallo", "hi", "guten tag"].includes(input)
        }
        return ["hello", "hi", "good day"].includes(input)
    },

    stopRecognition: function() {
        if (typeof appVoice.recognitionObject == "object" && typeof appVoice.recognitionObject !== 'undefined' && appVoice.recognitionObject !== null) {
            appVoice.recognitionObject.stop();
        }
    },

    abortRecognition: function() {
        if (typeof appVoice.recognitionObject == "object" && typeof appVoice.recognitionObject !== 'undefined' && appVoice.recognitionObject !== null) {
            appVoice.recognitionObject.abort();
        }
    },

    toggleVoiceMode: function() {
        if (appVoice.isActive) {
            appVoice.deactivateVoiceMode();
        } else {
            appVoice.activateVoiceMode();
        }
    },

    activateVoiceMode: function() {
        appVoice.deactivateVoiceMode(true);
        localStorage.setItem('appVoice.isActive', true);
        document.getElementById(appVoice.tagIdMicrophoneImage).classList.remove("hidden");
        document.getElementById(appVoice.tagIdButtonVoice + "-on").classList.remove("hidden");
        document.getElementById(appVoice.tagIdButtonVoice + "-off").classList.add("hidden");
        Main.currentSolution.setAttribute("readonly", "readonly");
        appVoice.isActive = true;
        appVoice.startRecognition();
        appSystem.events.dispatchEvent(new CustomEvent('voice-mode-start-after'));
    },

    deactivateVoiceMode: function(isJustARestart = false) {
        appVoice.stopRecognition();
        clearInterval(appVoice.mobileSoundDetectionInterval);
        appVoice.mobileSoundDetectionInterval = null;
        if (!isJustARestart) {
            document.getElementById(appVoice.tagIdMicrophoneImage).classList.add("hidden");
            document.getElementById(appVoice.tagIdButtonVoice + "-on").classList.add("hidden");
            document.getElementById(appVoice.tagIdButtonVoice + "-off").classList.remove("hidden");
            appVoice.isActive = false;
            localStorage.setItem('appVoice.isActive', false);
            Main.currentSolution.removeAttribute("readonly");
            appSystem.events.dispatchEvent(new CustomEvent('voice-mode-end-after'));
        }
    },

    // TODO: unit tests
    // "0, 366" => "0.366"
    // "8 Uhr" => "8"
    // "drei" => "3"
    guessFinalVoiceInput: function(s) {
        let tempInput = s.replace("Uhr", "").replace(",", ".").replace(/ /g, "");
        let c = parseFloat(tempInput);
        if (c) {
            return c;
        }
        return false;
    },

    guessVoiceInput: function(s) {
        s = s.replace(",", ".");
        if (s.length != appMath.result.toString().length) {
            return false;
        }
        let c = parseFloat(s);
        if (c == appMath.factor1 || c == appMath.factor2) {
            return false;
        }
        let analizationResult = Main.analizeTempSolution(c);
        if (c == appMath.result) {
            Main.currentSolution.value = s;
            Main.processInput();
            appVoice.setStatusPlaceholder()
            return true;
        }
        return false;
    },

    setStatusPlaceholder: function() {
        if (appVoice.isActive) {
            if (appVoice.isRecognitionRunning()) {
                Main.currentSolution.placeholder = "...";
                return;
            }
            Main.currentSolution.placeholder = "🙉";
            return;
        }
        Main.currentSolution.placeholder = "=";
    },

    toggleVoiceTech: function() {
        if (appVoice.isVoiceTechEndless) {
            appVoice.setVoiceTechNoise();
        } else {
            appVoice.setVoiceTechEndless();
        }
    },

    setVoiceTechEndless: function() {
        appVoice.isVoiceTechEndless = true;
        localStorage.setItem(appVoice.voiceTechIsEndlessLocalStorageKey, true);
        document.getElementById(appVoice.tagIdButtonVoiceTech + "-endless").classList.remove("hidden");
        document.getElementById(appVoice.tagIdButtonVoiceTech + "-noise").classList.add("hidden");
        appVoice.deactivateVoiceMode();
    },

    setVoiceTechNoise: function() {
        appVoice.isVoiceTechEndless = false;
        localStorage.setItem(appVoice.voiceTechIsEndlessLocalStorageKey, false);
        document.getElementById(appVoice.tagIdButtonVoiceTech + "-endless").classList.add("hidden");
        document.getElementById(appVoice.tagIdButtonVoiceTech + "-noise").classList.remove("hidden");
        appVoice.deactivateVoiceMode();
    },

    init: function() {

        appSystem.events.addEventListener('solution-found', function(e) {
            // workaround to omit mobile beeps as mutch as possible
            appVoice.isBetweenTasks = true;
        });

        appSystem.events.addEventListener('solution-timed-out', function(e) {
            // workaround to omit mobile beeps as mutch as possible
            appVoice.isBetweenTasks = true;
        });

        appSystem.events.addEventListener('new-task-created', function(e) {
            appVoice.isBetweenTasks = false;
            if (appVoice.isActive) {
                setTimeout(function() {
                    appVoice.startRecognition();
                }, 100)
            }
            appVoice.setStatusPlaceholder();
        });

        document.getElementById(appVoice.tagIdButtonVoiceTech).addEventListener('click', function(e) {
            appVoice.toggleVoiceTech();
        });

        appSystem.events.addEventListener('speak-before', function(e) {
            if (appVoice.isActive) {
                appVoice.abortRecognition();
            }
            appVoice.setStatusPlaceholder();
        });

        appSystem.events.addEventListener('speak-after', function(e) {
            if (appVoice.isActive) {
                setTimeout(function() {
                    appVoice.startRecognition();
                }, 100)
            }
            appVoice.setStatusPlaceholder();
        });

        document.getElementById(appVoice.tagIdButtonVoice).addEventListener('click', appVoice.toggleVoiceMode)

        // if (localStorage.getItem(appVoice.voiceTechIsEndlessLocalStorageKey)) {
        //     appVoice.isVoiceTechEndless = !localStorage.getItem(appVoice.voiceTechIsEndlessLocalStorageKey);
        // } else {
        //     appVoice.isVoiceTechEndless = !appPage.isDesktopMode();
        // }
        appVoice.isVoiceTechEndless = false;
        appVoice.toggleVoiceTech();
    },
};