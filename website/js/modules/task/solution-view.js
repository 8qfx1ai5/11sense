import * as appSystem from '../main/system.js'
import * as Main from '../main/main.js';
import * as appMath from '../math/math.js'

export let appSolution = {
    tagIdClipboard: "clipboard",
    localStorageKeySolutionGuideInterval: "solution-guide-interval",
    tagIdSolutionGuideInput: "solution-guide-selector",
    solutionGuideInterval: false,

    solutionGuideIntervalObject: false,

    tagIdAutoTaskSelector: "auto-task-selector",
    localStorageAutoTaskInterval: "autoTaskInterval",
    startTime: false,
    endTime: false,
    autoTaskTimer: false,

    isSolutionGuideActive: function() {
        return this.getSolutionGuideInterval();
    },

    getSolutionGuideInterval: function() {
        return this.solutionGuideInterval;
    },

    saveSolutionGuideInterval: function() {
        let v = document.getElementById(this.tagIdSolutionGuideInput).value;
        if (v == "" || v == "-" || v == "off") {
            localStorage.setItem(this.localStorageKeySolutionGuideInterval, false);
            this.solutionGuideInterval = false;
            this.stopSolutionGuideLoop();
            return;
        }
        localStorage.setItem(this.localStorageKeySolutionGuideInterval, v * 1000);
        this.solutionGuideInterval = v * 1000;
        this.startNewSolutionGuideLoop();
    },

    stopSolutionGuideLoop: function() {
        appSystem.log("stop solution guide loop", 1);
        if (this.solutionGuideIntervalObject) {
            clearTimeout(this.solutionGuideIntervalObject);
        }
        this.solutionGuideIntervalObject = false;
    },

    startNewSolutionGuideLoop: function() {
        this.stopSolutionGuideLoop();
        if (!this.isSolutionGuideActive()) {
            return;
        }
        let interval = this.getSolutionGuideInterval();
        appSystem.log("start new solution guide loop: '" + interval + "'", 2);
        this.solutionGuideIntervalObject = setTimeout(function() {
            appSystem.events.dispatchEvent(new CustomEvent('solution-timed-out'));
        }, interval);
    },

    isAutoTaskActive: function() {
        return 0 < this.getAutoTaskInterval();
    },

    startAutoTask: function() {
        let interval = this.getAutoTaskInterval();
        if (0 < interval) {
            this.autoTaskTimer = setInterval(function() {
                if (!this.endTime) {
                    this.stopAutoTask();
                    Main.currentSolution.style.backgroundSize = "0%";
                    return
                }
                // Get today's date and time
                let now = performance.now();
                Main.currentSolution.style.backgroundSize = ((now - this.endTime) * 102 / interval) + "%";
                // if (2000 <= now - this.endTime && now - this.endTime < 2010) {
                //     Main.currentSolution.focus();
                //     window.scrollTo(0, 0);
                // }
                if (appSound.hasPendingSoundOutput()) {
                    return;
                }
                if (2000 < now - this.endTime) {
                    // more than 2 seconds are passed (omit fullscreen error)
                    if (interval < now - this.endTime) {
                        Main.currentTask.click();
                        this.stopAutoTask();
                    }
                } else {
                    // less than 2 seconds are passed
                    if (interval < now - this.endTime) {
                        Main.currentTask.click();
                        this.stopAutoTask();
                    }
                }

            }, 10);
        }
    },

    stopAutoTask: function() {
        clearInterval(this.autoTaskTimer);
    },

    saveAutoTaskInterval: function() {
        let v = document.getElementById(this.tagIdAutoTaskSelector).value;
        this.stopAutoTask()
        if (v == "∞") {
            localStorage.setItem(this.localStorageAutoTaskInterval, -1)
            return;
        }
        localStorage.setItem(this.localStorageAutoTaskInterval, v * 1000);
        this.startNewSolutionGuideLoop()
    },

    getAutoTaskInterval: function() {
        let i = localStorage.getItem(this.localStorageAutoTaskInterval);
        if (!i || i == "") {
            this.saveAutoTaskInterval()
            i = localStorage.getItem(this.localStorageAutoTaskInterval);
        }
        return i;
    },

    updateViewSolution: function() {
        Main.currentTask.innerHTML = "<span class='mainColor'>" + Main.formatNumberForDisplay(appMath.factor1) + " ⋅ " + Main.formatNumberForDisplay(appMath.factor2) + " = </span> <span class='valid'>" + Main.formatNumberForDisplay(appMath.result) + " ✓</span>"
        Main.currentSolution.value = ""
        Main.currentSolution.placeholder = ""
        if (this.endTime) {
            Main.currentSolution.placeholder = ((this.endTime - this.startTime).toFixed(0) / 1000).toString() + " sec."
        }
    },

    updateViewSolutionGuide: function() {
        Main.currentTask.innerHTML = "<span class='mainColor'>" + Main.formatNumberForDisplay(appMath.factor1) + " ⋅ " + Main.formatNumberForDisplay(appMath.factor2) + "</span> = <span class='mainColor'>" + Main.formatNumberForDisplay(appMath.result) + "</span>"
        Main.currentSolution.value = ""
        Main.currentSolution.placeholder = ""
    },

    // function creates and sets the content of the solution page for Pro mode
    updateSolutionPro: function() {
        let keys = Array.from(appMath.fractions.keys());
        Main.psolutions.innerHTML = "";
        let f1s = appMath.factor1.toString();
        let f2s = appMath.factor2.toString();
        let rs = appMath.result.toString();
        let rSplit = rs.split(".");
        let rDecimals = appMath.getNumberOfDecimals(appMath.result);
        let f1Split = f1s.split(".");
        let f2Split = f2s.split(".");
        Main.SolutionTask.innerHTML = Main.formatNumberForDisplay(appMath.factor1) + " ⋅ " + Main.formatNumberForDisplay(appMath.factor2) + " = " + Main.formatNumberForDisplay(appMath.result);
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
            currentSum = appMath.addDecimal(currentSum, appMath.fractions.get(keys[i]));
            let factors = keys[i].split("⋅");
            //let x = currentSum * 100 / appMath.result
            Main.psolutions.innerHTML = Main.psolutions.innerHTML + (i + 1).toString().padStart(2) + ". " + this.formatNumberForMonoLength(factors[0], f1Split[0].length, appMath.factor1Decimals) + " ⋅ " + this.formatNumberForMonoLength(factors[1], f2Split[0].length, appMath.factor2Decimals) + " = " + this.formatNumberForMonoLength(appMath.fractions.get(keys[i]), rSplit[0].length, rDecimals) + " | " + this.formatNumberForMonoLength(currentSum, rSplit[0].length, rDecimals) + "<br />"
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
        Main.psolutions.innerHTML = "";
        let f1s = appMath.factor1.toString();
        let f2s = appMath.factor2.toString();
        let rs = appMath.result.toString();
        let rSplit = rs.split(".");
        let rDecimals = appMath.getNumberOfDecimals(appMath.result);
        let f1Split = f1s.split(".");
        let f2Split = f2s.split(".");
        Main.SolutionTask.innerHTML = Main.formatNumberForDisplay(appMath.factor1) + " ⋅ " + Main.formatNumberForDisplay(appMath.factor2) + " = " + Main.formatNumberForDisplay(appMath.result);
        let currentSum = 0;
        let currentF1 = 0;
        let iterations = parseInt(f1s.replace(".", ""), 10);
        let iterator = appMath.factor1 / iterations;
        for (let i = 1; i <= iterations; i++) {
            currentF1 = appMath.multiplyDecimal(i, iterator);
            currentSum = appMath.multiplyDecimal(currentF1, appMath.factor2);
            Main.psolutions.innerHTML = Main.psolutions.innerHTML + this.formatNumberForMonoLength(currentF1, f1Split[0].length, appMath.factor1Decimals) + " ⋅ " + this.formatNumberForMonoLength(appMath.factor2, f2Split[0].length, appMath.factor2Decimals) + " = " + this.formatNumberForMonoLength(currentSum, rSplit[0].length, rDecimals) + "<br />"
        }
    },

    // function creates and sets the content of the solution page
    updateSolution: function() {
        if (Main.isBeginnerModeActive()) {
            this.updateSolutionBeginner();
        } else {
            this.updateSolutionPro();
        }
    },

    onDocumentReadyEvent: function() {

        appSystem.events.addEventListener('solution-timed-out', function() {
            appSolution.stopSolutionGuideLoop();
            appSolution.startAutoTask();
            appSolution.endTime = performance.now();

            appSolution.updateViewSolutionGuide();
            if (0 == appSolution.getAutoTaskInterval()) {
                appMath.newTask();
            }
        });

        appSystem.events.addEventListener('solution-found', function(e) {
            appSolution.stopSolutionGuideLoop();
            appSolution.startAutoTask();
            appSolution.endTime = performance.now();
            appTask.wasSolved = true;

            appSolution.updateViewSolution();
            appStatistics.pushToStatistics(appMath.factor1, appMath.factor2, appMath.result, appSolution.endTime - appSolution.startTime);
            if (0 == appSolution.getAutoTaskInterval()) {
                appMath.newTask();
            }
        });

        appSystem.events.addEventListener('partial-solution-found', function(e) {
            text = "<span style='color: green'>" + Main.formatNumberForDisplay(e.detail.input) + "</span> (" + e.detail.parts + ")";
            let entry = document.createElement('p');
            entry.innerHTML = text;
            document.getElementById(appSolution.tagIdClipboard).prepend(entry);
        });

        appSystem.events.addEventListener('no-solution-found', function(e) {
            let text = Main.formatNumberForDisplay(e.detail.input) + " <span class='hint' onclick='appPage.toggleSolution()'>?</span>";
            let entry = document.createElement('p');
            entry.innerHTML = text;
            document.getElementById(appSolution.tagIdClipboard).prepend(entry);
        });

        appSystem.events.addEventListener('new-task-created', function(e) {
            document.getElementById(appSolution.tagIdClipboard).innerHTML = "";
            appSolution.startNewSolutionGuideLoop();
            appSolution.updateSolution()
            appSolution.stopAutoTask()
            appSolution.startTime = performance.now();
            appSolution.endTime = false;
        });
    },

    setDefaultValues: function() {
        let i = localStorage.getItem(this.localStorageAutoTaskInterval)
        if (i) {
            if (0 <= i) {
                document.getElementById(this.tagIdAutoTaskSelector).value = i / 1000
            } else {
                document.getElementById(this.tagIdAutoTaskSelector).value = "∞"
            }
            this.saveAutoTaskInterval();
        }

        let ii = localStorage.getItem(this.localStorageKeySolutionGuideInterval)
        if (ii == "false") {
            document.getElementById(this.tagIdSolutionGuideInput).value = "off"
        } else if (Number(ii)) {
            document.getElementById(this.tagIdSolutionGuideInput).value = ii / 1000
        }
        this.saveSolutionGuideInterval();
    },

    init: function() {
        this.onDocumentReadyEvent()
        this.setDefaultValues()
    }
};