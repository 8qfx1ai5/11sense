import * as appSystem from '../../main/system.js'
import * as appTranslation from '../../language/translation.js'
import * as appMath from '../../math/math.js'

export let isSoundModeActive = false;
let successMessagesDE = ["richtig", "sehr gut", "hervorragend", "gut gemacht", "genau so", "weiter so", "bravo", "ja"];
let successMessagesEN = ["right", "very good", "excellent", "well done", "that's it", "keep it up", "good job", "yes"];
let soundButtonLabelOn = document.getElementById('sound-button-on')
let soundButtonLabelOff = document.getElementById('sound-button-off')
let soundButton = document.getElementById('button-sound')

const browserIndependentSpeechSynthesisUtterance = window.webkitSpeechSynthesisUtterance || window.mozSpeechSynthesisUtterance || window.msSpeechSynthesisUtterance || window.oSpeechSynthesisUtterance || window.SpeechSynthesisUtterance
const browserIndependentSpeechSynthesis = window.webkitSpeechSynthesis || window.mozSpeechSynthesis || window.msSpeechSynthesis || window.oSpeechSynthesis || window.speechSynthesis

let voiceSelectButton = document.getElementById("speechVoiceType")

function getSuccessMessages() {
    if (appTranslation.getSelectedLanguage() == "de-DE") {
        return successMessagesDE
    }
    return successMessagesEN
}

function speak(s, state) {
    if (isSoundModeActive) {
        let statement = new browserIndependentSpeechSynthesisUtterance(s)
        statement.lang = appTranslation.getSelectedLanguage()
        statement.rate = 1
        statement.pitch = 1
        statement.voice = browserIndependentSpeechSynthesis.getVoices()[localStorage.getItem(voiceSelectButton.getAttribute('configName'))]
        statement.onstart = function(event) {
            window.dispatchEvent(new CustomEvent('speak-before'));
        }
        statement.onend = function(event) {
            window.dispatchEvent(new CustomEvent('speak-after'));
        }
        browserIndependentSpeechSynthesis.speak(statement);
    }
}

export function hasPendingSoundOutput() {
    return browserIndependentSpeechSynthesis.pending || browserIndependentSpeechSynthesis.speaking;
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
    window.dispatchEvent(new CustomEvent('sound-mode-start-after'));
}

export function deactivateSoundMode() {
    browserIndependentSpeechSynthesis.cancel()
    isSoundModeActive = false;
    soundButtonLabelOn.classList.add("hidden");
    soundButtonLabelOff.classList.remove("hidden");
    localStorage.setItem('isSoundModeActive', false);
    window.dispatchEvent(new CustomEvent('sound-mode-end-after'));
}

function updateVoiceTypeOptions() {
    // based on the selected language
    let voiceTypeOptions = []
    let voiceTypeOptionsStrings = []
    let voices = browserIndependentSpeechSynthesis.getVoices()

    let getSelectedLanguage = appTranslation.getSelectedLanguage()
    for (let i = 0; i < voices.length; i++) {
        if (voices[i].lang == getSelectedLanguage) {
            voiceTypeOptionsStrings.push('["' + i + '","' + voices[i].name + '"]')
            voiceTypeOptions[i] = voices[i].name
        }
    }

    let current = localStorage.getItem(voiceSelectButton.getAttribute('configName'))
    if (typeof voiceTypeOptions[current] === 'undefined') {
        current = voiceTypeOptions.find(Boolean)
        localStorage.setItem(voiceSelectButton.getAttribute('configName'), current)
    }

    voiceSelectButton.setAttribute('defaultOption', voiceTypeOptions[current])
    voiceSelectButton.setAttribute('options', '[' + voiceTypeOptionsStrings.join(',') + ']')
}

export function init() {

    window.addEventListener('repeat-task', function(e) {
        if (isSoundModeActive) {
            speak(e.detail.state.getTask().questionSUI);
        }
    });

    window.addEventListener('bunch-action-task-next', function(e) {
        if (isSoundModeActive) {
            browserIndependentSpeechSynthesis.cancel()
            speak(e.detail.state.getTask().questionSUI);
        }
    });

    window.addEventListener('bunch-action-task-previous', function(e) {
        if (isSoundModeActive) {
            browserIndependentSpeechSynthesis.cancel()
            speak(e.detail.state.getTask().questionSUI);
        }
    });

    window.addEventListener('sound-mode-start-after', function() {
        // speak intro after sounde mode was started
        if (isSoundModeActive) {
            speak(appTranslation.translateForSoundOutput("Hello! Let's train."))
        }
    });

    window.addEventListener(voiceSelectButton.getAttribute('configName') + '-changed', function() {
        // speak something after voice type was changed
        if (isSoundModeActive) {
            speak(appTranslation.translateForSoundOutput("Hello! I will support you."))
        }
    });

    window.addEventListener('config_changed', () => {
        // update possible voices (depending on the selected language)
        updateVoiceTypeOptions()
    })

    window.addEventListener('voice-mode-end-after', function(e) {
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

    window.addEventListener('give-status-answer-hallo', function(e) {
        if (isSoundModeActive) {
            speak(appTranslation.translateForSoundOutput("hello"));
        }
    });

    window.addEventListener('give-status-answer-yes', function(e) {
        if (isSoundModeActive) {
            speak(appTranslation.translateForSoundOutput("yes, I can hear you"));
        }
    });

    soundButton.addEventListener('click', toggleSoundMode)

    window.addEventListener("load", function() {
        updateVoiceTypeOptions()
    })
}