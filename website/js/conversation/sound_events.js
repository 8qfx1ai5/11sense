(function() {
    soundButtonLabelOn = document.getElementById('sound-button-on');
    soundButtonLabelOff = document.getElementById('sound-button-off');
    //isSoundModeActive = localStorage.getItem('isSoundModeActive') != "true";
    //toggleSoundMode();

    system.events.addEventListener('repeat-task', function(e) {
        if (isSoundModeActive) {
            speak(formatToSpeakableNumber(factor1) + " " + translateForSoundOutput("multiplied by") + " " + formatToSpeakableNumber(factor2), 1);
        }
    });

    system.events.addEventListener('new-task-created', function(e) {
        if (isSoundModeActive) {
            speak(formatToSpeakableNumber(factor1) + " " + translateForSoundOutput("multiplied by") + " " + formatToSpeakableNumber(factor2), 1);
        }
    });

    system.events.addEventListener('sound-mode-start-after', function(e) {
        if (isSoundModeActive) {
            speak(translateForSoundOutput("Hello, let's train."), 1);
            speak(formatToSpeakableNumber(factor1) + " " + translateForSoundOutput("multiplied by") + " " + formatToSpeakableNumber(factor2), 1);
        }
    });

    system.events.addEventListener('voice-mode-end-after', function(e) {
        if (isSoundModeActive) {
            speak(translateForSoundOutput("See you next time."), 1);
        }
    });

    system.events.addEventListener('partial-solution-found', function(e) {
        if (isSoundModeActive) {
            speak(formatToSpeakableNumber(e.detail.input) + ", " + translateForSoundOutput("that's the direction"));
        }
    });

    system.events.addEventListener('no-solution-found', function(e) {
        if (isSoundModeActive) {
            speak(formatToSpeakableNumber(e.detail.input) + "?");
        }
    });

    system.events.addEventListener('solution-found', function(e) {
        if (isSoundModeActive) {
            speak(getRandomElement(getSuccessMessages()));
            speak(translateForSoundOutput("is") + " " + formatToSpeakableNumber(e.detail.input) + "!");
        }
    });

    system.events.addEventListener('solution-timed-out', function(e) {
        if (isSoundModeActive) {
            speak(translateForSoundOutput("is") + " " + formatToSpeakableNumber(result) + "!");
        }
    });

    system.events.addEventListener('give-status-answer-hallo', function(e) {
        if (isSoundModeActive) {
            speak(translateForSoundOutput("hello"));
        }
    });

    system.events.addEventListener('give-status-answer-yes', function(e) {
        if (isSoundModeActive) {
            speak(translateForSoundOutput("yes, I can hear you"), 1);
        }
    });
})();