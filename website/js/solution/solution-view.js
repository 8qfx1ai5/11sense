let solution = {
    tagIdClipboard: "clipboard",
    localStorageKeySolutionGuideInterval: "solution-guide-interval",
    tagIdSolutionGuideInput: "solutionGuideInput",
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
        if (v === "" || v == "-") {
            // localStorage.setItem(this.localStorageKeySolutionGuideInterval, -1)
            this.solutionGuideInterval = -1;
            return;
        }
        v = Math.max(0, v)
        v = Math.min(100, v)
            // localStorage.setItem(this.localStorageKeySolutionGuideInterval, v * 1000);
        this.solutionGuideInterval = v * 1000;
        document.getElementById(this.tagIdSolutionGuideInput).value = v;
    },

    stopSolutionGuideLoop: function() {
        if (this.solutionGuideIntervalObject) {
            clearInterval(this.solutionGuideIntervalObject);
        }
        this.solutionGuideIntervalObject = false;
    },

    startNewSolutionGuideLoop: function() {
        this.stopSolutionGuideLoop();
        let interval = this.getSolutionGuideInterval();
        log("start new solution guide loop: '" + interval + "'", 2);
        this.solutionGuideIntervalObject = setInterval(function() {
            system.events.dispatchEvent(new CustomEvent('solution-timed-out'));
            solution.stopSolutionGuideLoop();
        }, this.getSolutionGuideInterval());
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

        document.getElementById(this.tagIdSolutionGuideInput).addEventListener("keydown", function(e) {
            if (!e) { var e = window.event; }
            // Enter is pressed
            if (e.keyCode == 13) { solution.saveSolutionGuideInterval(); }
        }, false);

        system.events.addEventListener('speak-after', function(e) {
            if (solution.isSolutionGuideActive()) {
                solution.startNewSolutionGuideLoop();
            }
        });
    }
};

(function() {
    solution.onDocumentReadyEvent();
})();