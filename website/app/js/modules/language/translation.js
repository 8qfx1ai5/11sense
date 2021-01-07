let storedLanguageKey = "storedLanguage"

export function getSelectedLanguage() {
    let languageSelector = document.getElementsByClassName("goog-te-combo");
    if (0 < languageSelector.length) {
        if (languageSelector[0].value == "de") {
            return "de-DE"
        }
    }
    return "en-US"
}

export function isSelectedLanguageGerman() {
    return getSelectedLanguage() == "de-DE"
}

export function setSelectedLanguage(l) {
    let newLanguage = 'en'
    if (l == 'de' || l == "de-DE") {
        newLanguage = 'de'
    }
    let languageSelector = document.getElementsByClassName("goog-te-combo")
    if (0 < languageSelector.length) {
        saveSelectedLanguage(newLanguage)
        languageSelector[0].value = newLanguage
        languageSelector[0].dispatchEvent(new Event('change'))
    }
}

function saveSelectedLanguage(l) {
    localStorage.setItem(storedLanguageKey, l)
}

function getStoredLanguage() {
    let language = localStorage.getItem(storedLanguageKey)
    if (!language || language == "") {
        return false
    }
    return language
}

function getInitLanguage() {
    let oldLanguage = getStoredLanguage()
    if (oldLanguage) {
        return oldLanguage
    }
    return getBrowserLanguage()
}

export function getBrowserLanguage() {
    return (navigator.language || navigator.userLanguage).split('-', 1)[0]
}

let translationTableSound = {
    "multiplied by": {
        "de-DE": "mal"
    },
    "times": {
        "de-DE": "mal"
    },
    "plus": {
        "de-DE": "plus"
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
    },
    "Well played. Let's have a look on the results.": {
        "de-DE": "Gut gespielt. Lass uns einen Blick auf die Ergebnisse werfen."
    }
}

export function translateForSoundOutput(key) {
    if (key in translationTableSound) {
        let lang = getSelectedLanguage()
        if (lang in translationTableSound[key]) {
            return translationTableSound[key][lang]
        }
    }
    return key
}

let translationTableScreen = {
    "The voice mode may require you to disable your screen saver to work as expected.": {
        "de-DE": "Im Sprachmodus musst du möglicherweise deinen Bildschirmschoner deaktivieren, damit er wie erwartet funktioniert."
    }
}

export function translateForScreenOutput(key) {
    if (key in translationTableScreen) {
        let lang = getSelectedLanguage()
        if (lang in translationTableScreen[key]) {
            return translationTableScreen[key][lang]
        }
    }
    return key
}

export function init() {

    setTimeout(function() {
        // hacks to ignore strange behavior of google translate
        let e = document.querySelector(".goog-te-combo").addEventListener('change', function(e) {
            saveSelectedLanguage(e.target.value)
        });
    }, 4000)
}