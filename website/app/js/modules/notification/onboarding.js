import * as appSystem from '../main/system.js'
import * as appTranslation from '../language/translation.js'

let list = {
    "voiceScreenSaverConflictHint": "The voice mode may require you to disable your screen saver to work as expected.",
    "voiceMicrophoneMissingPermission": "This feature of the Web App requires access to your microphone. Please grand permissions in the site settings of your browser."
}

export function requireMessage(key) {
    if (key in list) {
        if (localStorage.getItem("notification-" + key) != "send") {
            localStorage.setItem("notification-" + key, "required")
        }
    } else {
        appSystem.log("require message failed, key unknown: '" + key + "'", 3)
    }
}

export function sendMessageIfRequired(key) {
    if (key in list) {
        if (localStorage.getItem("notification-" + key) == "required") {
            alert(appTranslation.translateForScreenOutput(list[key]));
            localStorage.setItem("notification-" + key, "send")
        }
    } else {
        appSystem.log("send message failed, key unknown: '" + key + "'", 3)
    }
}

export function sendMessage(key) {
    if (key in list) {
        alert(appTranslation.translateForScreenOutput(list[key]));
    } else {
        appSystem.log("send message failed, key unknown: '" + key + "'", 3)
    }
}