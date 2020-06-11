import * as appSystem from '../main/system.js'
import * as Main from '../main/main.js'
import * as appMath from '../math/math.js'

export let appTask = {

    wasSolved: false,

    updateView: function() {
        Main.currentTask.innerHTML = Main.formatNumberForDisplay(appMath.factor1) + " <span class='mainColor'>⋅</span> " + Main.formatNumberForDisplay(appMath.factor2);
    },

    resetInput: function() {
        Main.currentSolution.value = "";
        Main.currentSolution.style.backgroundSize = "0%";
        Main.currentTask.classList.remove("valid");
        Main.currentTask.classList.remove("invalid");
        //Main.currentSolution.focus();
        Main.currentSolution.disabled = false;
        Main.Solution.style.display = "none";
    },

    init: function() {
        appSystem.events.addEventListener('new-task-created', function(e) {
            appTask.updateView()
            appTask.resetInput()
            appTask.wasSolved = false
        });
    }
};