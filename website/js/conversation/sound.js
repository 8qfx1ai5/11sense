let isSoundModeActive = false;
let successMessages = ["richtig", "sehr gut", "hervorragend", "gut gemacht", "genau so", "weiter so", "bravo", "ja"];
let soundButtonLabelOn;
let soundButtonLabelOff;

function speak(s, r = 1) {
    if (isSoundModeActive) {
        let statement = new SpeechSynthesisUtterance(s);
        statement.lang = 'de-DE';
        statement.rate = r;
        statement.pitch = 0.6
        statement.onstart = function(event) {
            appVoice.muteVoice();
        }
        statement.onend = function(event) {
            appVoice.remuteVoice();
        }
        speechSynthesis.speak(statement);
    }
}

function formatToSpeakableNumber(n) {
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
        isSoundModeActive = false;
        soundButtonLabelOn.classList.add("hidden");
        soundButtonLabelOff.classList.remove("hidden");
        localStorage.setItem('isSoundModeActive', false);
        system.events.dispatchEvent(new CustomEvent('sound-mode-end-after'));
    }
}