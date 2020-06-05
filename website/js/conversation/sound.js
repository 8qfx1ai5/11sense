let isSoundModeActive = false;
let successMessagesDE = ["richtig", "sehr gut", "hervorragend", "gut gemacht", "genau so", "weiter so", "bravo", "ja"];
let successMessagesEN = ["right", "very good", "excellent", "well done", "that's it", "keep it up", "good job", "yes"];
let soundButtonLabelOn;
let soundButtonLabelOff;

function getSuccessMessages() {
    if (getSelectedLanguage() == "de-DE") {
        return successMessagesDE
    }
    return successMessagesEN
}

function speak(s, r = 1) {
    if (isSoundModeActive) {
        let statement = new SpeechSynthesisUtterance(s);
        statement.lang = getSelectedLanguage();
        statement.rate = r;
        statement.pitch = 0.6
        statement.onstart = function(event) {
            system.events.dispatchEvent(new CustomEvent('speak-before'));
        }
        statement.onend = function(event) {
            system.events.dispatchEvent(new CustomEvent('speak-after'));
        }
        speechSynthesis.speak(statement);
    }
}

function hasPendingSoundOutput() {
    return speechSynthesis.pending || speechSynthesis.speaking;
}

function formatToSpeakableNumber(n) {
    if (getSelectedLanguage() == "de-DE") {
        let nS = n.toString();
        let nSsplit = nS.split(".");
        if (nSsplit.length < 2) {
            return nS;
        }
        let output = nSsplit[0] + ",";
        for (let i = 0; i < nSsplit[1].length; i++) {
            output += nSsplit[1][i] + " "
        }
        return output;
    }

    return n.toString();
}

function toggleSoundMode() {
    if (isSoundModeActive) {
        appSound.deactivateSoundMode();
    } else {
        appSound.acitvateSoundMode();
    }
}

let appSound = {
    acitvateSoundMode: function() {
        isSoundModeActive = true;
        soundButtonLabelOn.classList.remove("hidden");
        soundButtonLabelOff.classList.add("hidden");
        localStorage.setItem('isSoundModeActive', true);
        system.events.dispatchEvent(new CustomEvent('sound-mode-start-after'));
    },

    deactivateSoundMode: function() {
        speechSynthesis.cancel();
        isSoundModeActive = false;
        soundButtonLabelOn.classList.add("hidden");
        soundButtonLabelOff.classList.remove("hidden");
        localStorage.setItem('isSoundModeActive', false);
        system.events.dispatchEvent(new CustomEvent('sound-mode-end-after'));
    }
}