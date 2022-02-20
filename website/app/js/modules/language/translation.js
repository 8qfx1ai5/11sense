import * as appSystem from '../main/system.js'
import * as appConfig from '../config/ConfigStateMachine.js'

let selectLanguageButton = document.getElementById("select-language-button")
let cachedLanguage = false

export let supportedLanguages = ['en-US', 'de-DE']
export let defaultLanguage = ['en-US']

export function getSelectedLanguage() {
    return appConfig.currentConfig.getGlobalValue('selectedLanguage')
}

export function isSelectedLanguageGerman() {
    // TODO: this function should not be necessary
    return getSelectedLanguage() == "de-DE"
}

export function setLanguage(newLanguage) {
    if (supportedLanguages.includes(newLanguage)) {
        selectLanguageButton.setAttribute('value') = newLanguage
        saveSelectedLanguage(newLanguage)
        return
    }
    appSystem.log('selected language "' + newLanguage + '" not supported', 1)
}

function getInitLanguage() {
    let storedLanguage = getStoredLanguage()
    if (storedLanguage) {
        return storedLanguage
    }
    let browserLanguage = getBrowserLanguage()
    if (supportedLanguages.includes(browserLanguage)) {
        return browserLanguage
    }
    return defaultLanguage
}

function getBrowserLanguage() {
    return (navigator.language || navigator.userLanguage)
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
    "Hello! Let's train.": {
        "de-DE": "Hallo. Lass uns üben."
    },
    "Hello! I will support you.": {
        "de-DE": "Hallo. Ich werde dich unterstützen."
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

    window.addEventListener(selectLanguageButton.getAttribute('configName') + '-changed', () => {
        cachedLanguage = false
    })

}