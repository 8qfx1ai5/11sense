import { appVoice } from '../conversation/voice.js'
import * as appSound from '../conversation/sound.js'
import * as appSystem from '../main/system.js'

export let appConversation = {

    tagIdConversationButton: "button-conversation",

    toggleConversation: function() {
        if (appSound.isSoundModeActive && appVoice.isActive) {
            appConversation.deactivateConversationMode();
        } else {
            appConversation.activateConversationMode();
        }
    },

    activateConversationMode: function() {
        appVoice.activateVoiceMode();
        appSound.acitvateSoundMode();
    },

    deactivateConversationMode: function() {
        appVoice.deactivateVoiceMode();
        appSound.deactivateSoundMode();
    },

    init: function() {
        appConversation.updateConversationButton()
        appConversation.registerEvents()
    },

    updateConversationButton: function() {
        if (appSound.isSoundModeActive && appVoice.isActive) {
            document.getElementById(appConversation.tagIdConversationButton + "-on").classList.remove("hidden");
            document.getElementById(appConversation.tagIdConversationButton + "-off").classList.add("hidden");
        } else {
            document.getElementById(appConversation.tagIdConversationButton + "-on").classList.add("hidden");
            document.getElementById(appConversation.tagIdConversationButton + "-off").classList.remove("hidden");
        }
    },

    registerEvents: function() {
        appSystem.events.addEventListener('voice-mode-start-after', function(e) {
            appConversation.updateConversationButton();
        });

        appSystem.events.addEventListener('voice-mode-end-after', function(e) {
            appConversation.updateConversationButton();
        });

        appSystem.events.addEventListener('sound-mode-start-after', function(e) {
            appConversation.updateConversationButton();
        });

        appSystem.events.addEventListener('sound-mode-end-after', function(e) {
            appConversation.updateConversationButton();
        });

        document.getElementById(appConversation.tagIdConversationButton).addEventListener('click', appConversation.toggleConversation)
    }
};