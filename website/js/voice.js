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
            isDebugMode && console.log("start recognition");
            setStatusPlaceholder();
        }

        recognition.onresult = function(e) {
            isDebugMode && console.log(e.results);
            if (isVoiceModeTempMuted) {
                isDebugMode && console.log("muted.. dictation restart");
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
                    toggleVoiceMode();
                }

                if (e.results[e.results.length - 1].isFinal) {
                    if (["neue Aufgabe", "neu", "next", "weiter"].includes(e.results[e.results.length - 1][0].transcript.trim())) {
                        newTask(false);
                        return;
                    }
                    if (!wasSolved) {
                        let tempInput = e.results[e.results.length - 1][0].transcript.replace("Uhr", "").replace(",", ".").trim();
                        let c = parseFloat(tempInput);
                        if (c) {
                            currentSolution.value = c;
                            saveTempSolution();
                            setStatusPlaceholder()
                            isDebugMode && console.log("ok.. dictation restart");
                            recognition.stop();
                            return;
                        }
                    }
                } else {
                    let input = e.results[e.results.length - 1][0].transcript.replace("Uhr", "");
                    input = input.replace("/", " ");
                    if (guessVoiceInput(input.replace(/ /g, "").replace(/[/]/g, ""))) {
                        isDebugMode && console.log("ok.. dictation restart");
                        recognition.stop();
                        return;
                    }
                    let parts = input.split(" ");
                    for (let i = 0; i < parts.length; i++) {
                        isDebugMode && console.log(parts[i]);
                        if (guessVoiceInput(parts[i])) {
                            isDebugMode && console.log("ok.. dictation restart");
                            recognition.stop();
                            return;
                        }
                        isDebugMode && console.log("invalid");
                    }
                }
            }
        };

        recognition.onerror = function(e) {
            currentSolution.placeholder = "🙉";
            isDebugMode && console.log("uppps.. dictation interrupted");
            recognition.stop();
        }

        recognition.onend = function(e) {
            currentSolution.placeholder = "🙉";
            isDebugMode && console.log("dictation finished");
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
    localStorage.setItem('isVoiceModeActive', true);
    micImage.classList.remove("hidden");
    voiceButtonLabelOn.classList.remove("hidden");
    voiceButtonLabelOff.classList.add("hidden");
    currentSolution.setAttribute("readonly", "readonly");
    isVoiceModeActive = true;
    isVoiceModeTempMuted = false;
    startDictation();
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
    isDebugMode && console.log("muted = " + isVoiceModeTempMuted);
    setStatusPlaceholder();
    if (typeof recognition == "object") {
        isDebugMode && console.log("recognition aborted by mute");
        wasCanceledByMute = true;
        recognition.abort();
    }
}

function remuteVoice() {
    isVoiceModeTempMuted = false;
    isDebugMode && console.log("muted = " + isVoiceModeTempMuted);
    setStatusPlaceholder();
    if (wasCanceledByMute) {
        wasCanceledByMute = false;
        startDictation();
    }
}