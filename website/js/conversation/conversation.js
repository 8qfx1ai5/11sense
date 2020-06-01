let appConversation = {

    tagIdConversationButton: "button-conversation",

    toggleConversation: function() {
        if (isSoundModeActive && appVoice.isActive) {
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

    updateConversationButton: function() {
        if (isSoundModeActive && appVoice.isActive) {
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