import * as appSystem from '../main/system.js'

export let isSoundModeActive = false;
let successMessagesDE = ["richtig", "sehr gut", "hervorragend", "gut gemacht", "genau so", "weiter so", "bravo", "ja"];
let successMessagesEN = ["right", "very good", "excellent", "well done", "that's it", "keep it up", "good job", "yes"];
let soundButtonLabelOn;
let soundButtonLabelOff;

function getSuccessMessages() {
    if (appTranslation.getSelectedLanguage() == "de-DE") {
        return successMessagesDE
    }
    return successMessagesEN
}

function speak(s, r = 1) {
    if (isSoundModeActive) {
        let statement = new SpeechSynthesisUtterance(s);
        statement.lang = appTranslation.getSelectedLanguage();
        statement.rate = r;
        statement.pitch = 0.6
        statement.onstart = function(event) {
            appSystem.events.dispatchEvent(new CustomEvent('speak-before'));
        }
        statement.onend = function(event) {
            appSystem.events.dispatchEvent(new CustomEvent('speak-after'));
        }
        speechSynthesis.speak(statement);
    }
}

export function hasPendingSoundOutput() {
    return speechSynthesis.pending || speechSynthesis.speaking;
}

function formatToSpeakableNumber(n) {
    if (appTranslation.getSelectedLanguage() == "de-DE") {
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

export function toggleSoundMode() {
    if (isSoundModeActive) {
        appSound.deactivateSoundMode();
    } else {
        appSound.acitvateSoundMode();
    }
}

export function acitvateSoundMode() {
    isSoundModeActive = true;
    soundButtonLabelOn.classList.remove("hidden");
    soundButtonLabelOff.classList.add("hidden");
    localStorage.setItem('isSoundModeActive', true);
    appSystem.events.dispatchEvent(new CustomEvent('sound-mode-start-after'));
}

export function deactivateSoundMode() {
    speechSynthesis.cancel();
    isSoundModeActive = false;
    soundButtonLabelOn.classList.add("hidden");
    soundButtonLabelOff.classList.remove("hidden");
    localStorage.setItem('isSoundModeActive', false);
    appSystem.events.dispatchEvent(new CustomEvent('sound-mode-end-after'));
}

export function init() {
    soundButtonLabelOn = document.getElementById('sound-button-on');
    soundButtonLabelOff = document.getElementById('sound-button-off');
    //isSoundModeActive = localStorage.getItem('isSoundModeActive') != "true";
    //toggleSoundMode();

    appSystem.events.addEventListener('repeat-task', function(e) {
        if (isSoundModeActive) {
            speak(formatToSpeakableNumber(appMath.factor1) + " " + appTranslation.translateForSoundOutput("multiplied by") + " " + formatToSpeakableNumber(appMath.factor2), 1);
        }
    });

    appSystem.events.addEventListener('new-task-created', function(e) {
        if (isSoundModeActive) {
            speak(formatToSpeakableNumber(appMath.factor1) + " " + appTranslation.translateForSoundOutput("multiplied by") + " " + formatToSpeakableNumber(appMath.factor2), 1);
        }
    });

    appSystem.events.addEventListener('sound-mode-start-after', function(e) {
        if (isSoundModeActive) {
            speak(appTranslation.translateForSoundOutput("Hello, let's train."), 1);
            appMath.newTask();
            // speak(formatToSpeakableNumber(appMath.factor1) + " " + appTranslation.translateForSoundOutput("multiplied by") + " " + formatToSpeakableNumber(appMath.factor2), 1);
        }
    });

    appSystem.events.addEventListener('voice-mode-end-after', function(e) {
        if (isSoundModeActive) {
            speak(appTranslation.translateForSoundOutput("See you next time."), 1);
        }
    });

    appSystem.events.addEventListener('partial-solution-found', function(e) {
        if (isSoundModeActive) {
            speak(formatToSpeakableNumber(e.detail.input) + ", " + appTranslation.translateForSoundOutput("that's the direction"));
        }
    });

    appSystem.events.addEventListener('no-solution-found', function(e) {
        if (isSoundModeActive) {
            speak(formatToSpeakableNumber(e.detail.input) + "?");
        }
    });

    appSystem.events.addEventListener('solution-found', function(e) {
        if (isSoundModeActive) {
            speak(appMath.getRandomElement(getSuccessMessages()));
            speak(appTranslation.translateForSoundOutput("is") + " " + formatToSpeakableNumber(e.detail.input) + "!");
        }
    });

    appSystem.events.addEventListener('solution-timed-out', function(e) {
        if (isSoundModeActive) {
            speak(appTranslation.translateForSoundOutput("is") + " " + formatToSpeakableNumber(appMath.result) + "!");
        }
    });

    appSystem.events.addEventListener('give-status-answer-hallo', function(e) {
        if (isSoundModeActive) {
            speak(appTranslation.translateForSoundOutput("hello"));
        }
    });

    appSystem.events.addEventListener('give-status-answer-yes', function(e) {
        if (isSoundModeActive) {
            speak(appTranslation.translateForSoundOutput("yes, I can hear you"), 1);
        }
    });
}