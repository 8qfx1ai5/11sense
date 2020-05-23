let isSoundModeActive = false;
let successMessages = ["richtig", "sehr gut", "hervorragend", "gut gemacht", "genau so", "weiter so", "bravo", "ja"];
let soundButtonLabelOn = document.getElementById('sound-button-on')
let soundButtonLabelOff = document.getElementById('sound-button-off')

function speak(s, r = 0.9) {
    if (isSoundModeActive) {
        let statement = new SpeechSynthesisUtterance(s);
        statement.lang = 'de-DE';
        statement.rate = r;
        statement.pitch = 0.4
        statement.onstart = function(event) {
            muteVoice();
        }
        statement.onend = function(event) {
            remuteVoice();
        }
        speechSynthesis.speak(statement);
    }
}

function toggleSoundMode() {
    if (isSoundModeActive) {
        // deactivate sound mode
        isSoundModeActive = false;
        soundButtonLabelOn.classList.add("hidden");
        soundButtonLabelOff.classList.remove("hidden");
        localStorage.setItem('isSoundModeActive', false);
    } else {
        // activate sound mode
        isSoundModeActive = true;
        soundButtonLabelOn.classList.remove("hidden");
        soundButtonLabelOff.classList.add("hidden");
        localStorage.setItem('isSoundModeActive', true);
        speak("Hallo", 1);
    }
}

(function() {
    isSoundModeActive = localStorage.getItem('isSoundModeActive') != "true";
    toggleSoundMode();
})();