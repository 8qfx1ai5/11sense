(function() {
    soundButtonLabelOn = document.getElementById('sound-button-on');
    soundButtonLabelOff = document.getElementById('sound-button-off');
    //isSoundModeActive = localStorage.getItem('isSoundModeActive') != "true";
    //toggleSoundMode();

    system.events.addEventListener('repeat-task', function(e) {
        if (isSoundModeActive) {
            speak(formatToSpeakableNumber(factor1) + " mal " + formatToSpeakableNumber(factor2), 1);
        }
    });

    system.events.addEventListener('new-task-created', function(e) {
        if (isSoundModeActive) {
            speak(formatToSpeakableNumber(factor1) + " mal " + formatToSpeakableNumber(factor2), 1);
        }
    });

    system.events.addEventListener('sound-mode-start-after', function(e) {
        if (isSoundModeActive) {
            speak("Hallo. Lass uns üben.", 1);
            speak(formatToSpeakableNumber(factor1) + " mal " + formatToSpeakableNumber(factor2), 1);
        }
    });

    system.events.addEventListener('voice-mode-end-after', function(e) {
        if (isSoundModeActive) {
            speak("Bis zum nächsten Mal.", 1);
        }
    });

    system.events.addEventListener('partial-solution-found', function(e) {
        if (isSoundModeActive) {
            speak(formatToSpeakableNumber(e.detail.input) + ", die Richtung stimmt");
        }
    });

    system.events.addEventListener('no-solution-found', function(e) {
        if (isSoundModeActive) {
            speak(formatToSpeakableNumber(e.detail.input) + "?");
        }
    });

    system.events.addEventListener('solution-found', function(e) {
        if (isSoundModeActive) {
            speak("ist gleich " + formatToSpeakableNumber(e.detail.input) + "! ");
            speak(getRandomElement(successMessages));
        }
    });

    system.events.addEventListener('solution-timed-out', function(e) {
        if (isSoundModeActive) {
            speak("ist " + formatToSpeakableNumber(result) + "! ");
        }
    });

    system.events.addEventListener('give-status-answer-hallo', function(e) {
        if (isSoundModeActive) {
            speak("hallo");
        }
    });

    system.events.addEventListener('give-status-answer-yes', function(e) {
        if (isSoundModeActive) {
            speak("ja, ich hoeree dir zu", 1);
        }
    });
})();