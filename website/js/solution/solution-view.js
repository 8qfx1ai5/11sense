let solution = {
    tagIdClipboard: "clipboard",
    localStorageKeySolutionGuideInterval: "solution-guide-interval",
    tagIdSolutionGuideInput: "solution-guide-selector",
    solutionGuideInterval: -1,

    solutionGuideIntervalObject: false,

    isSolutionGuideActive: function() {
        return 0 < this.getSolutionGuideInterval();
    },

    getSolutionGuideInterval: function() {
        // let i = localStorage.getItem(this.localStorageKeySolutionGuideInterval);
        // if (!i || i == "") {
        //     this.saveSolutionGuideInterval()
        //     i = localStorage.getItem(this.localStorageKeySolutionGuideInterval);
        // }
        // return i;
        return this.solutionGuideInterval;
    },

    saveSolutionGuideInterval: function() {
        let v = document.getElementById(this.tagIdSolutionGuideInput).value;
        if (v == "" || v == "-" || v == "OFF") {
            // localStorage.setItem(this.localStorageKeySolutionGuideInterval, -1)
            this.solutionGuideInterval = -1;
            return;
        }
        // v = Math.max(0, v)
        // v = Math.min(180, v)
        // localStorage.setItem(this.localStorageKeySolutionGuideInterval, v * 1000);
        this.solutionGuideInterval = v * 1000;
        this.startNewSolutionGuideLoop();
    },

    stopSolutionGuideLoop: function() {
        log("stop solution guide loop", 1);
        if (solution.solutionGuideIntervalObject) {
            clearTimeout(solution.solutionGuideIntervalObject);
        }
        solution.solutionGuideIntervalObject = false;
    },

    startNewSolutionGuideLoop: function() {
        this.stopSolutionGuideLoop();
        let interval = this.getSolutionGuideInterval();
        log("start new solution guide loop: '" + interval + "'", 2);
        solution.solutionGuideIntervalObject = setTimeout(function() {
            system.events.dispatchEvent(new CustomEvent('solution-timed-out'));
        }, interval);
    },

    onDocumentReadyEvent: function() {

        system.events.addEventListener('solution-found', function(e) {
            solution.stopSolutionGuideLoop();
        });

        system.events.addEventListener('partial-solution-found', function(e) {
            text = "<span style='color: green'>" + formatNumberForDisplay(e.detail.input) + "</span> (" + e.detail.parts + ")";
            let entry = document.createElement('p');
            entry.innerHTML = text;
            document.getElementById(solution.tagIdClipboard).prepend(entry);
        });

        system.events.addEventListener('no-solution-found', function(e) {
            let text = formatNumberForDisplay(e.detail.input) + " <span class='hint' onclick='toggleSolution()'>?</span>";
            let entry = document.createElement('p');
            entry.innerHTML = text;
            document.getElementById(solution.tagIdClipboard).prepend(entry);
        });

        system.events.addEventListener('new-task-created', function(e) {
            document.getElementById(solution.tagIdClipboard).innerHTML = "";
            if (solution.isSolutionGuideActive()) {
                solution.startNewSolutionGuideLoop();
            }
        });

        // system.events.addEventListener('speak-after', function(e) {
        //     if (solution.isSolutionGuideActive()) {
        //         solution.startNewSolutionGuideLoop();
        //     }
        // });

        solution.saveSolutionGuideInterval();
    }
};

(function() {
    solution.onDocumentReadyEvent();
})();