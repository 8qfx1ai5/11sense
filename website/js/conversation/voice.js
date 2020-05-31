let micImage;
let voiceButtonLabelOn;
let voiceButtonLabelOff;
let voiceMode;
let isVoiceModeActive = false;
let isVoiceModeTempMuted = false;
let wasCanceledByMute = false;
let recognition;

function startDictation() {

    if (!isVoiceModeActive) {
        return;
    }

    if (window.hasOwnProperty('webkitSpeechRecognition')) {

        //if (typeof recognition === 'undefined' || recognition === null) {
        recognition = new webkitSpeechRecognition();
        //}

        // recognition.stop();

        recognition.continuous = true;
        recognition.interimResults = true;



        recognition.lang = "de-DE";
        // recognition.lang = "en-US";
        recognition.start();

        recognition.onstart = function() {
            log("start recognition");
            setStatusPlaceholder();
        }

        recognition.onresult = function(e) {
            log(e.results, 2, "console");
            if (isVoiceModeTempMuted) {
                log("muted.. dictation abort");
                wasCanceledByMute = true;
                recognition.abort();
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
                        let foundNumber = guessFinalVoiceInput(detected);
                        log("final vr='" + detected + "' => '" + foundNumber + "'");
                        if (foundNumber) {
                            currentSolution.value = foundNumber;
                            saveTempSolution();
                            setStatusPlaceholder()
                            log("ok.. dictation restart", 1);
                            recognition.stop();
                            return;
                        }
                    }
                } else {
                    let input = detected.replace("Uhr", "");
                    input = input.replace("/", " ");
                    let inputTogether = input.replace(/ /g, "").replace(/[/]/g, "");
                    let parts = input.split(" ");
                    log("vr='" + detected + "' => (t: '" + inputTogether + "' p: '" + parts.join("|") + "')");
                    if (guessVoiceInput(inputTogether)) {
                        log("ok.. dictation restart", 1);
                        recognition.stop();
                        return;
                    }
                    for (let i = 0; i < parts.length; i++) {
                        log(parts[i], 1);
                        if (guessVoiceInput(parts[i])) {
                            log("ok.. dictation restart", 1);
                            recognition.stop();
                            return;
                        }
                        log("invalid", 1);
                    }
                }
            }
        };

        recognition.onerror = function(e) {
            currentSolution.placeholder = "🙉";
            log("uppps.. dictation interrupted", 1);
            recognition.stop();
        }

        recognition.onend = function(e) {
            currentSolution.placeholder = "🙉";
            log("dictation finished", 1);
            if (!wasCanceledByMute) {
                startDictation();
            }
        }
    }
}

function setStatusPlaceholder() {
    if (isVoiceModeActive) {
        if (isVoiceModeTempMuted) {
            currentSolution.placeholder = "🙉";
            return;
        }
        currentSolution.placeholder = "...";
        return;
    }
    currentSolution.placeholder = "=";
}

function guessInput() {
    if (isVoiceModeActive) {
        return;
    }
    if (currentSolution.value.length >= result.toString().length) {
        saveTempSolution()
    }
}

// TODO: unit tests
// "0, 366" => "0.366"
// "8 Uhr" => "8"
// "drei" => "3"
function guessFinalVoiceInput(s) {
    let tempInput = s.replace("Uhr", "").replace(",", ".").replace(/ /g, "");
    let c = parseFloat(tempInput);
    if (c) {
        return c;
    }
    return false;
}

function guessVoiceInput(s) {
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
        setStatusPlaceholder()
        return true;
    }
    return false;
}

function toggleVoiceMode() {
    if (isVoiceModeActive) {
        deactivateVoiceMode();
    } else {
        activateVoiceMode();
    }
}

function activateVoiceMode() {
    if (!isVoiceModeActive) {
        localStorage.setItem('isVoiceModeActive', true);
        micImage.classList.remove("hidden");
        voiceButtonLabelOn.classList.remove("hidden");
        voiceButtonLabelOff.classList.add("hidden");
        currentSolution.setAttribute("readonly", "readonly");
        isVoiceModeActive = true;
        isVoiceModeTempMuted = false;
        startDictation();
    } else {
        localStorage.setItem('isVoiceModeActive', true);
        micImage.classList.remove("hidden");
        voiceButtonLabelOn.classList.remove("hidden");
        voiceButtonLabelOff.classList.add("hidden");
        currentSolution.setAttribute("readonly", "readonly");
        isVoiceModeActive = true;
        isVoiceModeTempMuted = false;
    }
    system.events.dispatchEvent(new CustomEvent('voice-mode-start-after'));
}

function deactivateVoiceMode() {
    if (typeof recognition == "object") {
        recognition.stop();
    }
    localStorage.setItem('isVoiceModeActive', false);
    currentSolution.removeAttribute("readonly");
    voiceButtonLabelOn.classList.add("hidden");
    voiceButtonLabelOff.classList.remove("hidden");
    isVoiceModeActive = false;
    isVoiceModeTempMuted = true;
    micImage.classList.add("hidden");
    system.events.dispatchEvent(new CustomEvent('voice-mode-end-after'));
}

function toggleVoiceMute() {
    if (isVoiceModeTempMuted) {
        remuteVoice();
    } else {
        muteVoice();
    }
}

function muteVoice() {
    isVoiceModeTempMuted = true;
    if (isVoiceModeActive) {
        log("muted = " + isVoiceModeTempMuted, 2);
    }
    setStatusPlaceholder();
    if (typeof recognition == "object") {
        log("recognition aborted by mute");
        wasCanceledByMute = true;
        recognition.abort();
    }
}

function remuteVoice() {
    isVoiceModeTempMuted = false;
    if (isVoiceModeActive) {
        log("muted = " + isVoiceModeTempMuted, 2);
    }
    setStatusPlaceholder();
    if (wasCanceledByMute) {
        wasCanceledByMute = false;
        startDictation();
    }
}