import * as appSystem from '../../main/system.js'
import * as appTranslation from '../../language/translation.js'
import * as appMath from '../../math/math.js'

export let isSoundModeActive = false;
let successMessagesDE = ["richtig", "sehr gut", "hervorragend", "gut gemacht", "genau so", "weiter so", "bravo", "ja"];
let successMessagesEN = ["right", "very good", "excellent", "well done", "that's it", "keep it up", "good job", "yes"];
let soundButtonLabelOn;
let soundButtonLabelOff;

let tagIdButtonSound = "button-sound"

function getSuccessMessages() {
    if (appTranslation.getSelectedLanguage() == "de-DE") {
        return successMessagesDE
    }
    return successMessagesEN
}

function speak(s, state) {
    if (isSoundModeActive) {
        let statement = new SpeechSynthesisUtterance(s);
        statement.lang = appTranslation.getSelectedLanguage();
        // statement.rate = r;
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

function toggleSoundMode() {
    if (isSoundModeActive) {
        deactivateSoundMode();
    } else {
        acitvateSoundMode();
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
            speak(e.detail.state.getTask().questionSUI);
        }
    });

    window.addEventListener('bunch-action-task-next', function(e) {
        if (isSoundModeActive) {
            speechSynthesis.cancel()
            speak(e.detail.state.getTask().questionSUI);
        }
    });

    window.addEventListener('bunch-action-task-previous', function(e) {
        if (isSoundModeActive) {
            speechSynthesis.cancel()
            speak(e.detail.state.getTask().questionSUI);
        }
    });

    appSystem.events.addEventListener('sound-mode-start-after', function() {
        if (isSoundModeActive) {
            speak(appTranslation.translateForSoundOutput("Hello, let's train."));
        }
    });

    appSystem.events.addEventListener('voice-mode-end-after', function(e) {
        if (isSoundModeActive) {
            speak(appTranslation.translateForSoundOutput("See you next time."));
        }
    });

    window.addEventListener('bunch-action-solution-partial-found', function(e) {
        if (isSoundModeActive) {
            speak(e.detail.state.getTask().getLastAnswer().outputSUI + ", " + appTranslation.translateForSoundOutput("that's the direction"));
        }
    });

    window.addEventListener('bunch-action-solution-invalid', function(e) {
        if (isSoundModeActive) {
            speak(e.detail.state.getTask().getLastAnswer().outputSUI + "?");
        }
    });

    window.addEventListener('bunch-action-solution-found', function(e) {
        if (isSoundModeActive) {
            speak(appMath.getRandomElement(getSuccessMessages()));
            speak(appTranslation.translateForSoundOutput("is") + " " + e.detail.state.getTask().answerSUI + "!");
        }
    });

    window.addEventListener('bunch-action-solution-timed-out', function(e) {
        if (isSoundModeActive) {
            speak(appTranslation.translateForSoundOutput("is") + " " + e.detail.state.getTask().answerSUI + "!");
        }
    });

    window.addEventListener('bunch-action-submit', function(e) {
        if (isSoundModeActive) {
            speak(appTranslation.translateForSoundOutput("Well played. Let's have a look on the results."));
        }
    });

    appSystem.events.addEventListener('give-status-answer-hallo', function(e) {
        if (isSoundModeActive) {
            speak(appTranslation.translateForSoundOutput("hello"));
        }
    });

    appSystem.events.addEventListener('give-status-answer-yes', function(e) {
        if (isSoundModeActive) {
            speak(appTranslation.translateForSoundOutput("yes, I can hear you"));
        }
    });

    document.getElementById(tagIdButtonSound).addEventListener('click', toggleSoundMode)

}