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
let funnySmilies = ["😋", "😛", "😜", "🤪", "😝", "🤗", "🤭", "🤫", "🤨", "😏", "🤯", "🤠", "🥳", "😎", "🤓", "🧐", "😲", "😳", "🥺", "😱", "😈", "😺", "😸", "😹", "😻", "😼", "😽", "🙀"]

function toggleTrainerPage() {
    if (trainerPage.classList.contains("hidden")) {
        showTrainerPage();
        currentSolution.focus();
    } else {
        hideTrainerPage();
    }
}

function showTrainerPage() {
    trainerPage.classList.removeﬂ("hidden")
    hideNav();
}

function hideTrainerPage() {
    trainerPage.classList.add("hidden")
}

function toggleSolution() {
    if (Solution.style.display === "none") {
        showSolution()
    } else {
        hideSolution()
        currentSolution.focus();
    }
}

function showSolution() {
    Solution.style.display = "block";
    hideNav();
    Solution.focus();
}

function hideSolution() {
    Solution.style.display = "none";
}

function toggleFullScreen() {
    let element = document.documentElement
    if (!document.fullscreen && !document.mozFullScreen && !document.webkitFullScreen && !document.msRequestFullscreen) {
        enterFullscreen()
    } else {
        exitFullscreen()
    }
    hideNav();
    currentSolution.focus();
}

function enterFullscreen() {
    try {
        let element = document.documentElement
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    } catch (e) {} finally {}
}

function exitFullscreen() {
    try {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    } catch (e) {} finally {}
}

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

    updateViewSolution()

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
                hideNav();
                currentSolution.focus();
                window.scrollTo(0, 0);
            }
            if (2000 < now - endTime) {
                // more than 2 seconds are passed (omit fullscreen error)
                if (interval < now - endTime) {
                    newTask(false);
                    clearInterval(autoTaskTimer);
                }
            } else {
                // less than 2 seconds are passed
                if (interval < now - endTime) {
                    newTask();
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
    currentTask.innerHTML = factor1.toString() + " ⋅ " + factor2.toString() + " = <span class='valid'>" + formatNumberForDisplay(result) + " ✓</span>"
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
    SolutionTask.innerHTML = f1s + " ⋅ " + f2s + " = " + result.toString();
    let resultLength = result.toString().length;
    let currentSum = 0;
    keys.sort(function(a, b) {
        return b.length - a.length;
    });
    for (let i = 0; i < keys.length; i++) {
        currentSum += fractions.get(keys[i])
        let factors = keys[i].split("⋅");
        let f1padded = factors[0].padStart(f1s.length);
        let f2padded = factors[1].padStart(f2s.length);
        let productPadded = fractions.get(keys[i]).toString().padStart(resultLength)
        let x = currentSum * 100 / result
        psolutions.innerHTML = psolutions.innerHTML + (i + 1).toString().padStart(2) + ". " + f1padded + " ⋅ " + f2padded + " = " + productPadded + " | " + currentSum.toString().padStart(resultLength) + " ≙ " + x.toFixed(2).padStart(6) + "%" + "<br />"
    }
}

// function creates and sets the content of the solution page for beginner mode
function updateSolutionBeginner() {
    psolutions.innerHTML = "";
    let f1s = factor1.toString();
    let f2s = factor2.toString();
    SolutionTask.innerHTML = f1s + " ⋅ " + f2s + " = " + result.toString();
    let resultLength = result.toString().length;
    let currentSum = 0;
    for (let i = 1; i <= factor1; i++) {
        currentSum += factor2;
        let x = currentSum * 100 / result
        psolutions.innerHTML = psolutions.innerHTML + (i).toString() + " ⋅ " + f2s + " = " + currentSum.toString().padStart(resultLength) + " ≙ " + x.toFixed(2).padStart(6) + "%" + "<br />"

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
    hideNav();
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
    hideNav();
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
        tempSolutions.innerHTML = currentSolution.value + " ?<br/>" + tempSolutions.innerHTML
        if (!isVoiceModeActive) {
            currentSolution.placeholder = "="
        }
        speak(c + "?");
        //startDictation();
    } else if (c == result) {
        tempSolutions.innerHTML = "<span style='color: green'>" + currentSolution.value + "</span> (" + analizationResult + ")<br/>" + tempSolutions.innerHTML
        validateResult();
        if (0 == getAutoTaskInterval()) {
            newTask();
        }
    } else {
        tempSolutions.innerHTML = "<span style='color: green'>" + currentSolution.value + "</span> (" + analizationResult + ")<br/>" + tempSolutions.innerHTML
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
        keys[i] = keys[i].replace(".", ",");
    }
    return keys.join("+")
}

function toggleNav() {
    if (navigation.classList.contains("hidden")) {
        showNav();
    } else {
        hideNav();
        currentSolution.focus();
    }
}

function showNav() {
    navigation.classList.remove("hidden");
    hideSolution();
    navigation.focus();
}

function hideNav() {
    navigation.classList.add("hidden")
}

function clearSolutions() {
    tempSolutions.innerHTML = ""
    currentSolution.focus();
}