export let appNotification = {

    list: {
        "voiceScreenSaverConflictHint": "The voice mode may require you to disable your screen saver to work as expected."
    },

    requireMessage: function(key) {
        if (key in this.list) {
            if (localStorage.getItem("notification-" + key) != "send") {
                localStorage.setItem("notification-" + key, "required")
            }
        } else {
            appSystem.log("require message failed, key unknown: '" + key + "'", 3)
        }
    },

    sendMessageIfRequired: function(key) {
        if (key in this.list) {
            if (localStorage.getItem("notification-" + key) == "required") {
                alert(appTranslation.translateForScreenOutput(this.list[key]));
                localStorage.setItem("notification-" + key, "send")
            }
        } else {
            appSystem.log("send message failed, key unknown: '" + key + "'", 3)
        }
    }
};