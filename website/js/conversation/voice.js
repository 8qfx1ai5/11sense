let appVoice = {

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
        if (!this.isActive) {
            log("rc start omitted, voice not active", 1);
            return;
        }
        if (this.isRecognitionRunning()) {
            log("rc start omitted, already exists", 1);
            return;
        }
        if (solution.isAutoTaskActive() && this.isBetweenTasks) {
            log("rc start omitted, between tasks", 1);
            return;
        }
        if (hasPendingSoundOutput()) {
            log("rc start omitted, has pending sound", 1);
            return;
        }
        appNotification.sendMessageIfRequired("voiceScreenSaverConflictHint");

        if (this.isVoiceTechEndless) {
            this.startRecognitionEndless();
        } else {
            this.startRecognitionNoise();
        }
    },

    startRecognitionEndless: function() {
        if (!appVoice.isActive) {
            return;
        }

        if (window.hasOwnProperty('webkitSpeechRecognition')) {

            if (typeof appVoice.recognitionObject !== "object" || typeof appVoice.recognitionObject === 'undefined' || appVoice.recognitionObject === null) {
                appVoice.recognitionObject = new webkitSpeechRecognition();
                appVoice.recognitionObject.continuous = true;
                appVoice.recognitionObject.interimResults = true;
                appVoice.recognitionObject.lang = getSelectedLanguage();
            }

            // appVoice.recognitionObject.lang = "en-US";
            try { // calling it twice will throw...
                appVoice.recognitionObject.start();
            } catch (e) {
                return;
            }

            appVoice.recognitionObject.onstart = function() {
                log("start recognition endless");
                appVoice.setStatusPlaceholder();
                appVoice.lastInputs = [];
                clearTimeout(appVoice.recognitionKillTimout)
                appVoice.recognitionKillTimout = setTimeout(function() {
                    log("dictation timeout stop")
                    appVoice.recognitionObject.dispatchEvent(new SpeechRecognitionResult());
                }, 3000)
            }

            appVoice.recognitionObject.onresult = appVoice.recognitionOResult;

            appVoice.recognitionObject.onerror = function(e) {
                currentSolution.placeholder = "🙉";
                clearTimeout(appVoice.recognitionKillTimout)
                switch (e.error) {
                    case "no-speech":
                    case "aborted":
                        log("dictation hint: " + e.error, 1);
                        appVoice.stopRecognition();
                        break;
                    case "not-allowed":
                        if (!isDesktopMode()) {
                            appNotification.requireMessage("voiceScreenSaverConflictHint");
                        }
                    case "audio-capture":
                    case "network":
                    case "service-not-allowed":
                    case "bad-grammar":
                    case "language-not-supported":
                    default:
                        log("dictation critical error: " + e.error, 3, "app")
                        log(e, 3, "console");
                        appVoice.abortRecognition();
                        break;
                }
                appVoice.recognitionObject = null;
                appVoice.lastInputs = [];
            }

            appVoice.recognitionObject.onend = function(e) {
                currentSolution.placeholder = "🙉";
                log("dictation finished", 1);
                appVoice.recognitionObject = null;
                clearTimeout(appVoice.recognitionKillTimout)
                appVoice.startRecognition();
                appVoice.lastInputs = [];
            }

            appVoice.recognitionObject.onaudioend = function(e) {
                currentSolution.placeholder = "🙉";
                log("dictation audio ended", 1);
                clearTimeout(appVoice.recognitionKillTimout)
                appVoice.stopRecognition();
                appVoice.recognitionObject = null;
                appVoice.lastInputs = [];
            }
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
                        function(e) { log(e.message) }
                    );
                } else alert('getUserMedia not supported in this browser.');
            }

            appVoice.mobileSoundDetectionInterval = setInterval(function() {
                if (!appVoice.mediaStreamObject) {
                    return;
                }
                if (!appVoice.isRecognitionRunning()) {
                    // log("try to find noise");
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
                    log(data);
                    if (data.some(v => v)) { // if there is data above the given db limit
                        log("noise found, start recognition");
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
        appVoice.recognitionObject.lang = getSelectedLanguage();

        // appVoice.recognitionObject.lang = "en-US";
        try { // calling it twice will throw...
            appVoice.recognitionObject.start();
        } catch (e) {
            return;
        }

        appVoice.recognitionObject.onstart = function() {
            log("start recognition noise");
            appVoice.setStatusPlaceholder();
            appVoice.lastInputs = [];
        }

        appVoice.recognitionObject.onresult = appVoice.recognitionOResult;

        appVoice.recognitionObject.onerror = function(e) {
            currentSolution.placeholder = "🙉";
            log("uppps.. dictation interrupted", 1);
            appVoice.stopRecognition();
            appVoice.lastInputs = [];
        }

        appVoice.recognitionObject.onend = function(e) {
            currentSolution.placeholder = "🙉";
            log("dictation finished", 1);
            appVoice.recognitionObject = null;
            appVoice.lastInputs = [];

            // appVoice.startRecognition();
        }
    },

    recognitionOResult: function(e) {
        log(e.results, 2, "console");
        if (!appVoice.isActive) {
            log("recognition inactive, abborting..");
            appVoice.abortRecognition();
        } else {
            let currentResult = e.results[e.results.length - 1][0].transcript.trim();
            if (currentResult.length <= 10) {
                currentSolution.placeholder = currentResult;
            } else {
                currentSolution.placeholder = currentResult.substring(0, 8) + "..";
            }

            if (currentResult == "stop") {
                appConversation.deactivateConversationMode();
            }
            let detected = e.results[e.results.length - 1][0].transcript;
            if (e.results[e.results.length - 1].isFinal) {
                let lang = getSelectedLanguage()
                let command = detected.trim().toLowerCase();
                if (appVoice.lastInputs.includes(command)) {
                    return;
                }
                if (appVoice.isCommandNewTask(lang, command)) {
                    system.events.dispatchEvent(new CustomEvent('create-new-task'));
                    appVoice.lastInputs.push(command)
                    newTask(false);
                    return;
                }
                if (appVoice.isCommandRepeatTask(lang, command)) {
                    appVoice.lastInputs.push(command)
                    system.events.dispatchEvent(new CustomEvent('repeat-task'));
                    return;
                }
                if (appVoice.isCommandAreYouThere(lang, command)) {
                    appVoice.lastInputs.push(command)
                    system.events.dispatchEvent(new CustomEvent('give-status-answer-yes'));
                    return;
                }
                if (appVoice.isCommandHello(lang, command)) {
                    appVoice.lastInputs.push(command)
                    system.events.dispatchEvent(new CustomEvent('give-status-answer-hallo'));
                    return;
                }
                if (!wasSolved) {
                    let foundNumber = appVoice.guessFinalVoiceInput(detected);
                    log("final vr='" + detected + "' => '" + foundNumber + "'");
                    if (foundNumber && !appVoice.lastInputs.includes(foundNumber.toString())) {
                        appVoice.lastInputs.push(foundNumber.toString());
                        currentSolution.value = foundNumber;
                        processInput();
                        appVoice.setStatusPlaceholder()
                        log("ok.. dictation restart", 1);
                        appVoice.stopRecognition();
                        return;
                    }
                }
            } else {
                let input = detected.replace("Uhr", "");
                input = input.replace("/", " ");
                let inputTogether = input.replace(/ /g, "").replace(/[/]/g, "");
                let parts = input.split(" ");
                log("vr='" + detected + "' => (t: '" + inputTogether + "' p: '" + parts.join("|") + "')");
                if (!appVoice.lastInputs.includes(inputTogether) && appVoice.guessVoiceInput(inputTogether)) {
                    appVoice.lastInputs.push(inputTogether);
                    log("ok.. dictation restart", 1);
                    appVoice.stopRecognition();
                    return;
                }
                for (let i = 0; i < parts.length; i++) {
                    log(parts[i], 1);
                    if (!appVoice.lastInputs.includes(parts[i]) && appVoice.guessVoiceInput(parts[i])) {
                        appVoice.lastInputs.push(parts[i]);
                        log("ok.. dictation restart", 1);
                        appVoice.stopRecognition();
                        return;
                    }
                    log("invalid", 1);
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
            this.deactivateVoiceMode();
        } else {
            this.activateVoiceMode();
        }
    },

    activateVoiceMode: function() {
        appVoice.deactivateVoiceMode();
        localStorage.setItem('appVoice.isActive', true);
        document.getElementById(this.tagIdMicrophoneImage).classList.remove("hidden");
        document.getElementById(this.tagIdButtonVoice + "-on").classList.remove("hidden");
        document.getElementById(this.tagIdButtonVoice + "-off").classList.add("hidden");
        currentSolution.setAttribute("readonly", "readonly");
        appVoice.isActive = true;
        appVoice.startRecognition();
        system.events.dispatchEvent(new CustomEvent('voice-mode-start-after'));
    },

    deactivateVoiceMode: function() {
        appVoice.isActive = false;
        appVoice.stopRecognition();
        localStorage.setItem('appVoice.isActive', false);
        currentSolution.removeAttribute("readonly");
        document.getElementById(this.tagIdButtonVoice + "-on").classList.add("hidden");
        document.getElementById(this.tagIdButtonVoice + "-off").classList.remove("hidden");
        clearInterval(appVoice.mobileSoundDetectionInterval);
        document.getElementById(this.tagIdMicrophoneImage).classList.add("hidden");
        system.events.dispatchEvent(new CustomEvent('voice-mode-end-after'));
        this.mobileSoundDetectionInterval = null;
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
        if (s.length != result.toString().length) {
            return false;
        }
        let c = parseFloat(s);
        if (c == factor1 || c == factor2) {
            return false;
        }
        let analizationResult = analizeTempSolution(c);
        if (c == result) {
            currentSolution.value = s;
            processInput();
            appVoice.setStatusPlaceholder()
            return true;
        }
        return false;
    },

    setStatusPlaceholder: function() {
        if (appVoice.isActive) {
            if (appVoice.isRecognitionRunning()) {
                currentSolution.placeholder = "...";
                return;
            }
            currentSolution.placeholder = "🙉";
            return;
        }
        currentSolution.placeholder = "=";
    },

    toggleVoiceTech: function() {
        if (this.isVoiceTechEndless) {
            this.setVoiceTechNoise();
        } else {
            this.setVoiceTechEndless();
        }
    },

    setVoiceTechEndless: function() {
        this.isVoiceTechEndless = true;
        localStorage.setItem(this.voiceTechIsEndlessLocalStorageKey, true);
        document.getElementById(this.tagIdButtonVoiceTech + "-endless").classList.remove("hidden");
        document.getElementById(this.tagIdButtonVoiceTech + "-noise").classList.add("hidden");
        this.deactivateVoiceMode();
    },

    setVoiceTechNoise: function() {
        this.isVoiceTechEndless = false;
        localStorage.setItem(this.voiceTechIsEndlessLocalStorageKey, false);
        document.getElementById(this.tagIdButtonVoiceTech + "-endless").classList.add("hidden");
        document.getElementById(this.tagIdButtonVoiceTech + "-noise").classList.remove("hidden");
        this.deactivateVoiceMode();
    },

    registerEventListener: function() {

        system.events.addEventListener('solution-found', function(e) {
            // workaround to omit mobile beeps as mutch as possible
            appVoice.isBetweenTasks = true;
        });

        system.events.addEventListener('solution-timed-out', function(e) {
            // workaround to omit mobile beeps as mutch as possible
            appVoice.isBetweenTasks = true;
        });

        system.events.addEventListener('new-task-created', function(e) {
            appVoice.isBetweenTasks = false;
            if (appVoice.isActive) {
                setTimeout(function() {
                    appVoice.startRecognition();
                }, 100)
            }
            appVoice.setStatusPlaceholder();
        });

        document.getElementById(this.tagIdButtonVoiceTech).addEventListener('click', function(e) {
            appVoice.toggleVoiceTech();
        });

        system.events.addEventListener('speak-before', function(e) {
            if (appVoice.isActive) {
                appVoice.abortRecognition();
            }
            appVoice.setStatusPlaceholder();
        });

        system.events.addEventListener('speak-after', function(e) {
            if (appVoice.isActive) {
                setTimeout(function() {
                    appVoice.startRecognition();
                }, 100)
            }
            appVoice.setStatusPlaceholder();
        });

        // if (localStorage.getItem(appVoice.voiceTechIsEndlessLocalStorageKey)) {
        //     appVoice.isVoiceTechEndless = !localStorage.getItem(appVoice.voiceTechIsEndlessLocalStorageKey);
        // } else {
        //     appVoice.isVoiceTechEndless = !isDesktopMode();
        // }
        appVoice.isVoiceTechEndless = false;
        appVoice.toggleVoiceTech();
    },
};

(function() {
    appVoice.registerEventListener();
})();