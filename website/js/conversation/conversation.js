let appConversation = {

    tagIdConversationButton: "button-conversation",

    toggleConversation: function() {
        if (isSoundModeActive && isVoiceModeActive) {
            this.deactivateConversationMode();
        } else {
            this.activateConversationMode();
        }
    },

    activateConversationMode: function() {
        activateVoiceMode();
        appSound.acitvateSoundMode();
    },

    deactivateConversationMode: function() {
        deactivateVoiceMode();
        appSound.deactivateSoundMode();
    },

    updateConversationButton: function() {
        if (isSoundModeActive && isVoiceModeActive) {
            document.getElementById(this.tagIdConversationButton + "-on").classList.remove("hidden");
            document.getElementById(this.tagIdConversationButton + "-off").classList.add("hidden");
        } else {
            document.getElementById(this.tagIdConversationButton + "-on").classList.add("hidden");
            document.getElementById(this.tagIdConversationButton + "-off").classList.remove("hidden");
        }
    },

    registerEvents: function() {
        system.events.addEventListener('voice-mode-start-after', function(e) {
            appConversation.updateConversationButton();
        });

        system.events.addEventListener('voice-mode-end-after', function(e) {
            appConversation.updateConversationButton();
        });

        system.events.addEventListener('sound-mode-start-after', function(e) {
            appConversation.updateConversationButton();
        });

        system.events.addEventListener('sound-mode-end-after', function(e) {
            appConversation.updateConversationButton();
        });
    }
};

(function() {
    appConversation.registerEvents();
    appConversation.updateConversationButton();
})();