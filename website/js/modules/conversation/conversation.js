import { appVoice } from '../conversation/voice.js'
import * as appSound from '../conversation/sound.js'
import * as appSystem from '../main/system.js'

export let appConversation = {

    tagIdConversationButton: "button-conversation",

    toggleConversation: function() {
        if (appSound.isSoundModeActive && appVoice.isActive) {
            this.deactivateConversationMode();
        } else {
            this.activateConversationMode();
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
            document.getElementById(this.tagIdConversationButton + "-on").classList.remove("hidden");
            document.getElementById(this.tagIdConversationButton + "-off").classList.add("hidden");
        } else {
            document.getElementById(this.tagIdConversationButton + "-on").classList.add("hidden");
            document.getElementById(this.tagIdConversationButton + "-off").classList.remove("hidden");
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
    }
};