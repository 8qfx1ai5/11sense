import * as appVoice from './voice.js'
import * as appSound from './sound.js'
import * as appSystem from '../../main/system.js'

let tagIdConversationButton = "button-conversation"

function toggleConversation() {
    if (appSound.isSoundModeActive && appVoice.isActive) {
        deactivateConversationMode()
    } else {
        activateConversationMode()
    }
}

function activateConversationMode() {
    appVoice.activateVoiceMode()
    appSound.acitvateSoundMode()
}

function deactivateConversationMode() {
    appVoice.deactivateVoiceMode()
    appSound.deactivateSoundMode()
}

function updateConversationButton() {
    if (appSound.isSoundModeActive && appVoice.isActive) {
        document.getElementById(tagIdConversationButton + "-on").classList.remove("hidden")
        document.getElementById(tagIdConversationButton + "-off").classList.add("hidden")
    } else {
        document.getElementById(tagIdConversationButton + "-on").classList.add("hidden")
        document.getElementById(tagIdConversationButton + "-off").classList.remove("hidden")
    }
}

function registerEvents() {
    appSystem.events.addEventListener('voice-mode-start-after', function(e) {
        updateConversationButton()
    })

    appSystem.events.addEventListener('voice-mode-end-after', function(e) {
        updateConversationButton()
    })

    appSystem.events.addEventListener('sound-mode-start-after', function(e) {
        updateConversationButton()
    })

    appSystem.events.addEventListener('sound-mode-end-after', function(e) {
        updateConversationButton()
    })

    appSystem.events.addEventListener('request-deactivate-conversation', function(e) {
        deactivateConversationMode()
    })

    document.getElementById(tagIdConversationButton).addEventListener('click', toggleConversation)
}

export function init() {
    updateConversationButton()
    registerEvents()
}