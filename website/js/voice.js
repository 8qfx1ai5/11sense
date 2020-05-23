let micImage;
let voiceButtonLabelOn;
let voiceButtonLabelOff;
let voiceMode;
let isVoiceModeActive = false;
let isVoiceModeTempMuted = false;
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
            if (!isVoiceModeTempMuted) {
                currentSolution.placeholder = e.results[e.results.length - 1][0].transcript.trim();

                if (e.results[e.results.length - 1][0].transcript.trim() == "stop") {
                    toggleVoiceMode();
                }

                if (e.results[e.results.length - 1].isFinal) {
                    if (["neue Aufgabe", "neu", "next", "weiter"].includes(e.results[e.results.length - 1][0].transcript.trim())) {
                        newTask(false);
                        return;
                    }
                    if (!wasSolved) {
                        let c = parseInt(e.results[e.results.length - 1][0].transcript.replace("Uhr", "").trim(), 10);
                        if (c) {
                            currentSolution.value = c;
                            saveTempSolution();
                            setStatusPlaceholder()
                            isDebugMode && console.log("ok.. dictation restart");
                            recognition.stop();
                        }
                    }
                } else {
                    let input = e.results[e.results.length - 1][0].transcript.replace("Uhr", "");
                    input = input.replace("/", " ");
                    let parts = input.split(" ");
                    for (let i = 0; i < parts.length; i++) {
                        isDebugMode && console.log(parts[i]);
                        if (guessVoiceInput(parts[i])) {
                            isDebugMode && console.log("ok.. dictation restart");
                            recognition.stop();
                            break;
                        }
                        isDebugMode && console.log("invalid");
                    }
                }
            } else {
                isDebugMode && console.log("muted.. dictation restart");
                recognition.stop();
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
            startDictation();
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
    if (s.length != result.toString().length) {
        return false;
    }
    let c = parseInt(s, 10);
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
    // if (typeof recognition == "object") {
    //     recognition.stop();
    // }
}

function remuteVoice() {
    isVoiceModeTempMuted = false;
    isDebugMode && console.log("muted = " + isVoiceModeTempMuted);
    setStatusPlaceholder();

    // startDictation();
}