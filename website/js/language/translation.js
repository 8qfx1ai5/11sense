function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        // pageLanguage: 'en',
        includedLanguages: "de,en",
        defaultlanguage: "en"
    }, 'google_translate_element');
}

function getSelectedLanguage() {
    let languageSelector = document.getElementsByClassName("goog-te-combo");
    if (0 < languageSelector.length) {
        if (languageSelector[0].value == "de") {
            return "de-DE"
        }
    }
    return "en-US"
}

function setSelectedLanguage(l) {
    let languageSelector = document.getElementsByClassName("goog-te-combo");
    if (0 < languageSelector.length) {
        if (l == 'de' || l == "de-DE") {
            languageSelector[0].value = 'de';
        } else {
            languageSelector[0].value = 'en';
        }
        languageSelector[0].dispatchEvent(new Event('change'));
    }
}

function getBrowserLanguage() {
    return (navigator.language || navigator.userLanguage).split('-', 1)[0]
}

let translationTableSound = {
    "multiplied by": {
        "de-DE": "mal"
    },
    "is": {
        "de-DE": "ist"
    },
    "hello": {
        "de-DE": "hallo"
    },
    "yes, I can hear you": {
        "de-DE": "ja, ich hoeree dir zu"
    },
    "that's the direction": {
        "de-DE": "die Richtung stimmt"
    },
    "See you next time.": {
        "de-DE": "Bis zum nächsten Mal."
    },
    "Hello, let's train.": {
        "de-DE": "Hallo. Lass uns üben."
    }
}

function translateForSoundOutput(key) {
    if (key in translationTableSound) {
        let lang = getSelectedLanguage()
        if (lang in translationTableSound[key]) {
            return translationTableSound[key][lang]
        }
    }
    return key
}

let translationTableScreen = {
    "The Voice mode may require you to disable your screen saver to work as expected.": {
        "de-DE": "Im Sprachmodus müssen Sie möglicherweise Ihren Bildschirmschoner deaktivieren, damit er wie erwartet funktioniert."
    }
}

function translateForScreenOutput(key) {
    if (key in translationTableSound) {
        let lang = getSelectedLanguage()
        if (lang in translationTableSound[key]) {
            return translationTableSound[key][lang]
        }
    }
    return key
}