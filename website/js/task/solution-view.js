let solution = {
    tagIdClipboard: "clipboard",
    localStorageKeySolutionGuideInterval: "solution-guide-interval",
    tagIdSolutionGuideInput: "solution-guide-selector",
    solutionGuideInterval: -1,

    solutionGuideIntervalObject: false,

    startTime: false,
    endTime: false,
    autoTaskTimer: false,

    isSolutionGuideActive: function() {
        return 0 < this.getSolutionGuideInterval();
    },

    getSolutionGuideInterval: function() {
        return this.solutionGuideInterval;
    },

    saveSolutionGuideInterval: function() {
        let v = document.getElementById(this.tagIdSolutionGuideInput).value;
        if (v == "" || v == "-" || v == "off") {
            // localStorage.setItem(this.localStorageKeySolutionGuideInterval, -1)
            this.solutionGuideInterval = -1;
            this.stopSolutionGuideLoop();
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

    isAutoTaskActive: function() {
        return 0 < this.getAutoTaskInterval();
    },

    startAutoTask: function() {
        let interval = this.getAutoTaskInterval();
        if (0 < interval) {
            solution.autoTaskTimer = setInterval(function() {
                if (!solution.endTime) {
                    clearInterval(solution.autoTaskTimer);
                    currentSolution.style.backgroundSize = "0%";
                    return
                }
                // Get today's date and time
                let now = performance.now();
                currentSolution.style.backgroundSize = ((now - solution.endTime) * 125 / interval) + "%";
                // if (2000 <= now - solution.endTime && now - solution.endTime < 2010) {
                //     currentSolution.focus();
                //     window.scrollTo(0, 0);
                // }
                if (hasPendingSoundOutput()) {
                    return;
                }
                if (2000 < now - solution.endTime) {
                    // more than 2 seconds are passed (omit fullscreen error)
                    if (interval < now - solution.endTime) {
                        currentTask.click();
                        clearInterval(solution.autoTaskTimer);
                    }
                } else {
                    // less than 2 seconds are passed
                    if (interval < now - solution.endTime) {
                        currentTask.click();
                        clearInterval(solution.autoTaskTimer);
                    }
                }

            }, 10);
        }
    },

    saveAutoTaskInterval: function() {
        let v = autoTaskInput.value;
        if (v === "" || v == "-") {
            localStorage.setItem("autoTaskInterval", -1)
            return;
        }
        v = Math.max(0, v)
        v = Math.min(100, v)
        localStorage.setItem("autoTaskInterval", v * 1000);
        autoTaskInput.value = v;
    },

    getAutoTaskInterval: function() {
        let i = localStorage.getItem("autoTaskInterval");
        if (!i || i == "") {
            solution.saveAutoTaskInterval()
            i = localStorage.getItem("autoTaskInterval");
        }
        return i;
    },

    updateViewSolution: function() {
        currentTask.innerHTML = "<span class='mainColor'>" + formatNumberForDisplay(factor1) + " ⋅ " + formatNumberForDisplay(factor2) + " = </span> <span class='valid'>" + formatNumberForDisplay(result) + " ✓</span>"
        currentSolution.value = ""
        currentSolution.placeholder = ""
        if (solution.endTime) {
            currentSolution.placeholder = ((solution.endTime - solution.startTime).toFixed(0) / 1000).toString() + " sec."
        }
    },

    updateViewSolutionGuide: function() {
        currentTask.innerHTML = "<span class='mainColor'>" + formatNumberForDisplay(factor1) + " ⋅ " + formatNumberForDisplay(factor2) + " = </span>" + formatNumberForDisplay(result)
        currentSolution.value = ""
        currentSolution.placeholder = ""
    },

    // function creates and sets the content of the solution page for Pro mode
    updateSolutionPro: function() {
        let keys = Array.from(fractions.keys());
        psolutions.innerHTML = "";
        let f1s = factor1.toString();
        let f2s = factor2.toString();
        let rs = result.toString();
        let rSplit = rs.split(".");
        let rDecimals = getNumberOfDecimals(result);
        let f1Split = f1s.split(".");
        let f2Split = f2s.split(".");
        SolutionTask.innerHTML = formatNumberForDisplay(factor1) + " ⋅ " + formatNumberForDisplay(factor2) + " = " + formatNumberForDisplay(result);
        let currentSum = 0;
        keys.sort(function(a, b) {
            let aSplit = a.split("⋅");
            let a1 = aSplit[0].length - 1;
            if (aSplit[0].includes(".")) {
                a1 = (aSplit[0].length - 2) * -1;
            }
            let a2 = aSplit[1].length - 1;
            if (aSplit[1].includes(".")) {
                a2 = (aSplit[1].length - 2) * -1;
            }
            let bSplit = b.split("⋅");
            let b1 = bSplit[0].length - 1;
            if (bSplit[0].includes(".")) {
                b1 = (bSplit[0].length - 2) * -1;
            }
            let b2 = bSplit[1].length - 1;
            if (bSplit[1].includes(".")) {
                b2 = (bSplit[1].length - 2) * -1;
            }

            return b1 + b2 - a1 - a2;
        });
        for (let i = 0; i < keys.length; i++) {
            currentSum = addDecimal(currentSum, fractions.get(keys[i]));
            let factors = keys[i].split("⋅");
            //let x = currentSum * 100 / result
            psolutions.innerHTML = psolutions.innerHTML + (i + 1).toString().padStart(2) + ". " + this.formatNumberForMonoLength(factors[0], f1Split[0].length, factor1Decimals) + " ⋅ " + this.formatNumberForMonoLength(factors[1], f2Split[0].length, factor2Decimals) + " = " + this.formatNumberForMonoLength(fractions.get(keys[i]), rSplit[0].length, rDecimals) + " | " + this.formatNumberForMonoLength(currentSum, rSplit[0].length, rDecimals) + "<br />"
        }
    },

    formatNumberForMonoLength: function(n, x, y) {
        let ns = n.toString();
        let nSplit = ns.split(".");
        let result = nSplit[0].padStart(x, " ");
        if (nSplit.length < 2) {
            nSplit[1] = "0";
        }
        if (0 < y) {
            result += "." + nSplit[1].padEnd(y, " ")
        }
        return result.replace(/[.]/g, ",");
    },

    // function creates and sets the content of the solution page for beginner mode
    updateSolutionBeginner: function() {
        psolutions.innerHTML = "";
        let f1s = factor1.toString();
        let f2s = factor2.toString();
        let rs = result.toString();
        let rSplit = rs.split(".");
        let rDecimals = getNumberOfDecimals(result);
        let f1Split = f1s.split(".");
        let f2Split = f2s.split(".");
        SolutionTask.innerHTML = formatNumberForDisplay(factor1) + " ⋅ " + formatNumberForDisplay(factor2) + " = " + formatNumberForDisplay(result);
        let currentSum = 0;
        let currentF1 = 0;
        let iterations = parseInt(f1s.replace(".", ""), 10);
        let iterator = factor1 / iterations;
        for (let i = 1; i <= iterations; i++) {
            currentF1 = multiplyDecimal(i, iterator);
            currentSum = multiplyDecimal(currentF1, factor2);
            psolutions.innerHTML = psolutions.innerHTML + this.formatNumberForMonoLength(currentF1, f1Split[0].length, factor1Decimals) + " ⋅ " + this.formatNumberForMonoLength(factor2, f2Split[0].length, factor2Decimals) + " = " + this.formatNumberForMonoLength(currentSum, rSplit[0].length, rDecimals) + "<br />"
        }
    },

    // function creates and sets the content of the solution page
    updateSolution: function() {
        if (isBeginnerModeActive) {
            this.updateSolutionBeginner();
        } else {
            this.updateSolutionPro();
        }
    },

    onDocumentReadyEvent: function() {

        system.events.addEventListener('solution-timed-out', function() {
            solution.stopSolutionGuideLoop();
            solution.startAutoTask();
            solution.endTime = performance.now();

            solution.updateViewSolutionGuide();
            if (0 == solution.getAutoTaskInterval()) {
                newTask();
            }
        });

        system.events.addEventListener('solution-found', function(e) {
            solution.stopSolutionGuideLoop();
            solution.startAutoTask();
            solution.endTime = performance.now();
            wasSolved = true;

            solution.updateViewSolution();
            pushToStatistics(factor1, factor2, result, solution.endTime - solution.startTime);
            if (0 == solution.getAutoTaskInterval()) {
                newTask();
            }
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
            solution.updateSolution()
            clearInterval(solution.autoTaskTimer);
            solution.startTime = performance.now();
            solution.endTime = false;
        });

        solution.saveSolutionGuideInterval();
    }
};

(function() {
    solution.onDocumentReadyEvent();
})();