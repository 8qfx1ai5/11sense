let appVoice = {

    isActive: false,
    isMuted: false,
    wasCanceledByMute: false,
    recognitionObject: null,

    tagIdButtonVoice: "button-voice",
    tagIdMicrophoneImage: "mic-image",

    lastInputs: [],

    startRecognition: function() {
        if (isDesktopMode()) {
            this.startRecognitionDesktop();
        } else {
            this.startRecognitionMobile();
        }
    },

    startRecognitionDesktop: function() {
        if (!appVoice.isActive) {
            return;
        }

        if (window.hasOwnProperty('webkitSpeechRecognition')) {

            if (typeof appVoice.recognitionObject !== "object" || typeof appVoice.recognitionObject === 'undefined' || appVoice.recognitionObject === null) {
                appVoice.recognitionObject = new webkitSpeechRecognition();
                appVoice.recognitionObject.continuous = true;
                appVoice.recognitionObject.interimResults = true;
                appVoice.recognitionObject.lang = "de-DE";
            }

            // appVoice.recognitionObject.lang = "en-US";
            try { // calling it twice will throw...
                appVoice.recognitionObject.start();
            } catch (e) {
                return;
            }

            appVoice.recognitionObject.onstart = function() {
                log("start recognition");
                appVoice.setStatusPlaceholder();
                appVoice.lastInputs = [];
            }

            appVoice.recognitionObject.onresult = function(e) {
                log(e.results, 2, "console");
                if (!appVoice.isActive) {
                    log("recognition inactive, abborting..");
                    appVoice.wasCanceledByMute = true;
                    appVoice.abortRecognition();
                } else if (appVoice.isMuted) {
                    log("muted.. abort recognition..");
                    appVoice.wasCanceledByMute = true;
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
                        if (["neue aufgabe", "neu", "next", "weiter"].includes(detected.trim().toLowerCase())) {
                            system.events.dispatchEvent(new CustomEvent('create-new-task'));
                            newTask(false);
                            return;
                        }
                        if (["wiederhole", "wiederhole bitte", "bitte wiederhole", "bitte wiederholen", "kannst du das bitte wiederholen", "bitte wiederhole die aufgabe", "wiederholen", "noch mal", "bitte noch mal", "erneut", "erneut sagen", "wie bitte"].includes(detected.trim().toLowerCase())) {
                            system.events.dispatchEvent(new CustomEvent('repeat-task'));
                            return;
                        }
                        if (["dorie", "dori", "bist du noch da"].includes(detected.trim().toLowerCase())) {
                            system.events.dispatchEvent(new CustomEvent('give-status-answer-yes'));
                            return;
                        }
                        if (["hallo", "hi", "guten tag"].includes(detected.trim().toLowerCase())) {
                            system.events.dispatchEvent(new CustomEvent('give-status-answer-hallo'));
                            return;
                        }
                        if (!wasSolved) {
                            let foundNumber = appVoice.guessFinalVoiceInput(detected);
                            log("final vr='" + detected + "' => '" + foundNumber + "'");
                            if (foundNumber && !appVoice.lastInputs.includes(foundNumber.toString())) {
                                appVoice.lastInputs.push(foundNumber.toString());
                                currentSolution.value = foundNumber;
                                saveTempSolution();
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
            };

            appVoice.recognitionObject.onerror = function(e) {
                currentSolution.placeholder = "🙉";
                log("uppps.. dictation interrupted", 1);
                appVoice.stopRecognition();
                appVoice.lastInputs = [];
            }

            appVoice.recognitionObject.onend = function(e) {
                currentSolution.placeholder = "🙉";
                log("dictation finished", 1);
                if (!appVoice.wasCanceledByMute) {
                    appVoice.startRecognition();
                }
                appVoice.recognitionObject = null;
                appVoice.lastInputs = [];
            }
        }
    },

    startRecognitionMobile: function() {
        appVoice.startRecognitionDesktop();
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
        if (!appVoice.isActive) {
            localStorage.setItem('appVoice.isActive', true);
            document.getElementById(this.tagIdMicrophoneImage).classList.remove("hidden");
            document.getElementById(this.tagIdButtonVoice + "-on").classList.remove("hidden");
            document.getElementById(this.tagIdButtonVoice + "-off").classList.add("hidden");
            currentSolution.setAttribute("readonly", "readonly");
            appVoice.isActive = true;
            appVoice.isMuted = false;
            appVoice.startRecognition();
        } else {
            localStorage.setItem('appVoice.isActive', true);
            document.getElementById(this.tagIdMicrophoneImage).classList.remove("hidden");
            document.getElementById(this.tagIdButtonVoice + "-on").classList.remove("hidden");
            document.getElementById(this.tagIdButtonVoice + "-off").classList.add("hidden");
            currentSolution.setAttribute("readonly", "readonly");
            appVoice.isActive = true;
            appVoice.isMuted = false;
        }
        system.events.dispatchEvent(new CustomEvent('voice-mode-start-after'));
    },

    deactivateVoiceMode: function() {

        appVoice.stopRecognition();
        localStorage.setItem('appVoice.isActive', false);
        currentSolution.removeAttribute("readonly");
        document.getElementById(this.tagIdButtonVoice + "-on").classList.add("hidden");
        document.getElementById(this.tagIdButtonVoice + "-off").classList.remove("hidden");
        appVoice.isActive = false;
        appVoice.isMuted = true;
        document.getElementById(this.tagIdMicrophoneImage).classList.add("hidden");
        system.events.dispatchEvent(new CustomEvent('voice-mode-end-after'));
    },

    toggleVoiceMute: function() {
        if (appVoice.isMuted) {
            this.remuteVoice();
        } else {
            this.muteVoice();
        }
    },

    muteVoice: function() {
        appVoice.isMuted = true;
        if (appVoice.isActive) {
            log("muted = " + appVoice.isMuted, 2);
        }
        appVoice.setStatusPlaceholder();
        if (typeof appVoice.recognitionObject == "object") {
            log("recognition aborted by mute");
            appVoice.wasCanceledByMute = true;
            appVoice.abortRecognition();
        }
    },

    remuteVoice: function() {
        appVoice.isMuted = false;
        if (appVoice.isActive) {
            log("muted = " + appVoice.isMuted, 2);
        }
        appVoice.setStatusPlaceholder();
        if (appVoice.wasCanceledByMute) {
            appVoice.wasCanceledByMute = false;
            if (isDesktopMode()) {
                this.startRecognition();
            }
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
            saveTempSolution();
            appVoice.setStatusPlaceholder()
            return true;
        }
        return false;
    },

    setStatusPlaceholder: function() {
        if (appVoice.isActive) {
            if (appVoice.isMuted) {
                currentSolution.placeholder = "🙉";
                return;
            }
            currentSolution.placeholder = "...";
            return;
        }
        currentSolution.placeholder = "=";
    }
};

// // request a LocalMediaStream
// navigator.mediaDevices.getUserMedia({ audio: true })
//     // add our listeners
//     .then(stream => detectSilence(stream, stopRecognition, startDictation))
//     .catch(e => log(e.message));


// function detectSilence(
//     stream,
//     onSoundEnd = _ => {},
//     onSoundStart = _ => {},
//     silence_delay = 500,
//     min_decibels = -80
// ) {
//     const ctx = new AudioContext();
//     const analyser = ctx.createAnalyser();
//     const streamNode = ctx.createMediaStreamSource(stream);
//     streamNode.connect(analyser);
//     analyser.minDecibels = min_decibels;

//     const data = new Uint8Array(analyser.frequencyBinCount); // will hold our data
//     let silence_start = performance.now();
//     let triggered = false; // trigger only once per silence event

//     function loop(time) {
//         requestAnimationFrame(loop); // we'll loop every 60th of a second to check
//         analyser.getByteFrequencyData(data); // get current data
//         if (data.some(v => v)) { // if there is data above the given db limit
//             if (triggered) {
//                 triggered = false;
//                 onSoundStart();
//             }
//             silence_start = time; // set it to now
//         }
//         if (!triggered && time - silence_start > silence_delay) {
//             onSoundEnd();
//             triggered = true;
//         }
//     }
//     loop();
// }

(function() {

})();