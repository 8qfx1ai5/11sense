let currentTask;
let currentSolution;
let tempSolutions;
let f1input;
let f2input;
let navigation;
let Solution;
let psolutions;

let SolutionTask;
let autoTaskInput;
let trainerPage;
let header;

let isBeginnerModeActive = false;
let wasSolved = false;
let funnySmilies = ["😋", "😛", "😜", "🤪", "😝", "🤗", "🤭", "🤫", "🤨", "😏", "🤯", "🤠", "🥳", "😎", "🤓", "🧐", "😲", "😳", "🥺", "😱", "😈", "😺", "😸", "😹", "😻", "😼", "😽", "🙀"];

let startTime;
let endTime;
let autoTaskTimer;
// let recognition;

function validateResult() {
    muteVoice();
    //currentSolution.disabled = true;
    solution = currentSolution.value
    endTime = performance.now();
    //console.log(endTime);
    wasSolved = true;

    updateViewSolution();
    pushToStatistics(factor1, factor2, result, endTime - startTime);

    let interval = getAutoTaskInterval();
    if (0 < interval) {
        autoTaskTimer = setInterval(function() {
            if (!wasSolved || !endTime) {
                clearInterval(autoTaskTimer);
                currentSolution.style.backgroundSize = "0%";
                return
            }
            // Get today's date and time
            let now = performance.now();
            //console.log(now - endTime)
            currentSolution.style.backgroundSize = ((now - endTime) * 125 / interval) + "%";
            if (2000 <= now - endTime && now - endTime < 2010) {
                !isVoiceModeActive && enterFullscreen();
                currentSolution.focus();
                window.scrollTo(0, 0);
            }
            if (2000 < now - endTime) {
                // more than 2 seconds are passed (omit fullscreen error)
                if (interval < now - endTime) {
                    currentTask.click();
                    // newTask(false);
                    clearInterval(autoTaskTimer);
                }
            } else {
                // less than 2 seconds are passed
                if (interval < now - endTime) {
                    currentTask.click();
                    // newTask();
                    clearInterval(autoTaskTimer);
                }
            }

        }, 10);
    }
}

function saveAutoTaskInterval() {
    let v = autoTaskInput.value;
    if (v === "" || v == "-") {
        localStorage.setItem("autoTaskInterval", -1)
        return;
    }
    v = Math.max(0, v)
    v = Math.min(100, v)
    localStorage.setItem("autoTaskInterval", v * 1000);
    autoTaskInput.value = v;
}

function getAutoTaskInterval() {
    let i = localStorage.getItem("autoTaskInterval");
    if (!i || i == "") {
        saveAutoTaskInterval()
        i = localStorage.getItem("autoTaskInterval");
    }
    return i;
}

function updateView() {
    currentTask.innerText = factor1.toString().replace(".", ",") + " ⋅ " + factor2.toString().replace(".", ",")
    speak(formatToSpeakableNumber(factor1) + " mal " + formatToSpeakableNumber(factor2), 1.1);
    //currentSolution.focus();
}

function updateViewSolution() {
    currentTask.innerHTML = "<span class='mainColor'>" + formatNumberForDisplay(factor1) + " ⋅ " + formatNumberForDisplay(factor2) + " =</span> <span class='valid'>" + formatNumberForDisplay(result) + " ✓</span>"
    speak(getRandomElement(successMessages), 1);
    currentSolution.value = ""
    currentSolution.placeholder = ""
    if (endTime) {
        currentSolution.placeholder = ((endTime - startTime).toFixed(0) / 1000).toString() + " sec."
    }
    //currentSolution.focus();
}

// function creates and sets the content of the solution page for Pro mode
function updateSolutionPro() {
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
        psolutions.innerHTML = psolutions.innerHTML + (i + 1).toString().padStart(2) + ". " + formatNumberForMonoLength(factors[0], f1Split[0].length, factor1Decimals) + " ⋅ " + formatNumberForMonoLength(factors[1], f2Split[0].length, factor2Decimals) + " = " + formatNumberForMonoLength(fractions.get(keys[i]), rSplit[0].length, rDecimals) + " | " + formatNumberForMonoLength(currentSum, rSplit[0].length, rDecimals) + "<br />"
    }
}

function formatNumberForMonoLength(n, x, y) {
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
}

// function creates and sets the content of the solution page for beginner mode
function updateSolutionBeginner() {
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
        psolutions.innerHTML = psolutions.innerHTML + formatNumberForMonoLength(currentF1, f1Split[0].length, factor1Decimals) + " ⋅ " + formatNumberForMonoLength(factor2, f2Split[0].length, factor2Decimals) + " = " + formatNumberForMonoLength(currentSum, rSplit[0].length, rDecimals) + "<br />"
    }
}

// function creates and sets the content of the solution page
function updateSolution() {
    if (isBeginnerModeActive) {
        updateSolutionBeginner();
    } else {
        updateSolutionPro();
    }
}

function resetInput() {
    currentSolution.value = "";
    currentSolution.placeholder = "="
    if (isVoiceModeActive) {
        currentSolution.placeholder = "..."
    }
    currentSolution.style.backgroundSize = "0%";
    currentTask.classList.remove("valid");
    currentTask.classList.remove("invalid");
    tempSolutions.innerHTML = ""
        //currentSolution.focus();
    currentSolution.disabled = false;
    Solution.style.display = "none";
}

function formatNumberForDisplay(n) {
    return n.toString().replace(".", ",");
}

function saveTempSolutionPro() {
    currentSolution.focus();
    if (currentSolution.value == "") {
        if (!isVoiceModeActive) {
            let smiley;
            do {
                smiley = getRandomElement(funnySmilies);
            } while (currentSolution.placeholder == smiley);
            currentSolution.placeholder = smiley;
        }

        return
    }
    let c = parseFloat(currentSolution.value.replace(",", "."))
    let analizationResult = analizeTempSolution(c)
    if (analizationResult == "") {
        tempSolutions.innerHTML = formatNumberForDisplay(c) + " ?<br/>" + tempSolutions.innerHTML
        if (!isVoiceModeActive) {
            currentSolution.placeholder = "="
        }
        speak(formatToSpeakableNumber(c) + "?");
        //startDictation();
    } else if (c == result) {
        tempSolutions.innerHTML = "<span style='color: green'>" + formatNumberForDisplay(c) + "</span> (" + analizationResult + ")<br/>" + tempSolutions.innerHTML
        validateResult();
        if (0 == getAutoTaskInterval()) {
            newTask();
        }
    } else {
        tempSolutions.innerHTML = "<span style='color: green'>" + formatNumberForDisplay(c) + "</span> (" + analizationResult + ")<br/>" + tempSolutions.innerHTML
        let x = c * 100 / result
        currentSolution.placeholder = x.toFixed(1) + "%";
        speak(formatToSpeakableNumber(c) + ", die Richtung stimmt");
        //startDictation();
    }
    currentSolution.value = ""
}

function saveTempSolutionBeginner() {
    currentSolution.focus();
    if (currentSolution.value == "") {
        if (!isVoiceModeActive) {
            let smiley;
            do {
                smiley = getRandomElement(funnySmilies);
            } while (currentSolution.placeholder == smiley);
            currentSolution.placeholder = smiley;
        }

        return
    }
    let c = parseFloat(currentSolution.value)
    let analizationResult = analizeTempSolution(c)
    if (analizationResult == "") {
        tempSolutions.innerHTML = formatNumberForDisplay(c) + " ?<br/>" + tempSolutions.innerHTML
        if (!isVoiceModeActive) {
            currentSolution.placeholder = "="
        }
        speak(c + "?");
        //startDictation();
    } else if (c == result) {
        tempSolutions.innerHTML = "<span style='color: green'>" + formatNumberForDisplay(c) + "</span> (" + analizationResult + ")<br/>" + tempSolutions.innerHTML
        validateResult();
        if (0 == getAutoTaskInterval()) {
            newTask();
        }
    } else {
        tempSolutions.innerHTML = "<span style='color: green'>" + formatNumberForDisplay(c) + "</span> (" + analizationResult + ")<br/>" + tempSolutions.innerHTML
        let x = c * 100 / result
        currentSolution.placeholder = x.toFixed(1) + "%"
        speak(c + ", die Richtung stimmt");
        //startDictation();
    }
    currentSolution.value = ""
}

function saveTempSolution() {
    if (wasSolved && !isVoiceModeActive) {
        newTask();
        return;
    }
    if (isBeginnerModeActive) {
        saveTempSolutionBeginner();
    } else {
        saveTempSolutionPro();
    }
}

function analizeTempSolution(s) {
    let keys = [];
    if (isBeginnerModeActive) {
        keys = sumFlat(s)
    } else {
        keys = sumRecursive(0, 0, s)
    }
    for (let i = 0; i < keys.length; i++) {
        keys[i] = keys[i].replace(/[.]/g, ",");
    }
    return keys.join("+")
}

function clearSolutions() {
    tempSolutions.innerHTML = ""
    currentSolution.focus();
}