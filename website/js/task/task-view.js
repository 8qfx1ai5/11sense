let appTask = {

    updateView: function() {
        currentTask.innerHTML = formatNumberForDisplay(factor1) + " <span class='mainColor'>⋅</span> " + formatNumberForDisplay(factor2);
    },

    resetInput: function() {
        currentSolution.value = "";
        currentSolution.placeholder = "="
            // if (appVoice.isActive) {
            //     currentSolution.placeholder = "..."
            // }
        currentSolution.style.backgroundSize = "0%";
        currentTask.classList.remove("valid");
        currentTask.classList.remove("invalid");
        //currentSolution.focus();
        currentSolution.disabled = false;
        Solution.style.display = "none";
    },

    registerEvents: function() {
        system.events.addEventListener('new-task-created', function(e) {
            appTask.updateView()
            appTask.resetInput()
        });
    }
};

(function() {
    appTask.registerEvents();
})();