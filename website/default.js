let currentTask = document.getElementById('current-task');
let currentSolution = document.getElementById('solution');
let tempSolutions = document.getElementById('temp-solutions')
let f1input = document.getElementById('f1')
let f2input = document.getElementById('f2')
let navigation = document.getElementById('nav')
let Solution = document.getElementById('Solution')
let psolutions = document.getElementById('partial-solutions')
let voiceMode = document.getElementById('voiceMode')
let micImage = document.getElementById('mic-image')
let SolutionTask = document.getElementById('Solution-task')
let autoTaskInput = document.getElementById('autoTaskInput')
let trainerPage = document.getElementById('trainer-page')
let voiceButtonLabelOn = document.getElementById('voice-button-on')
let voiceButtonLabelOff = document.getElementById('voice-button-off')
let soundButtonLabelOn = document.getElementById('sound-button-on')
let soundButtonLabelOff = document.getElementById('sound-button-off')
let isVoiceModeActive = false;
let isSoundModeActive = false;
let isBeginnerModeActive = false;
let wasSolved = false;
let funnySmilies = ["😋", "😛", "😜", "🤪", "😝", "🤗", "🤭", "🤫", "🤨", "😏", "🤯", "🤠", "🥳", "😎", "🤓", "🧐", "😲", "😳", "🥺", "😱", "😈", "😺", "😸", "😹", "😻", "😼", "😽", "🙀"]
let successMessages = ["richtig", "sehr gut", "hervorragend", "gut gemacht", "genau so", "weiter so", "bravo", "ja"];
let lastTasks = [];

window.addEventListener("keydown", function (e) {

    if (e.keyCode == '13' || e.keyCode == '32') {
        // enter or space
        saveTempSolution();
    }
    else if (e.keyCode == '78') {
        // n
        newTask();
    }
    else if (e.keyCode == '83') {
        // s              
        toggleSolution();
        currentSolution.focus();
    }
    else if (e.keyCode == '79') {
        // o
        toggleNav();
    }
    else if (e.keyCode == '70') {
        // f
        toggleFullScreen();
        currentSolution.focus();
    }
    else if (e.keyCode == '86') {
        // V
        toggleVoiceMode();
        enterFullscreen();
        currentSolution.focus();
    }
});

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

function toggleVoiceMode() {
    if (isVoiceModeActive) {
        // deactivate voice mode
        if (typeof recognition == "object") {
            recognition.stop();
        }
        localStorage.setItem('isVoiceModeActive', false);
        currentSolution.removeAttribute("readonly");
        voiceButtonLabelOn.classList.add("hidden");
        voiceButtonLabelOff.classList.remove("hidden");
        isVoiceModeActive = false;
        micImage.classList.add("hidden");
        return;
    }
    // activate voice mode
    localStorage.setItem('isVoiceModeActive', true);
    micImage.classList.remove("hidden");
    voiceButtonLabelOn.classList.remove("hidden");
    voiceButtonLabelOff.classList.add("hidden");
    currentSolution.setAttribute("readonly", "readonly");
    isVoiceModeActive = true;
    startDictation();
}

function toggleSoundMode() {
    if (isSoundModeActive) {
        // deactivate sound mode
        isSoundModeActive = false;
        soundButtonLabelOn.classList.add("hidden");
        soundButtonLabelOff.classList.remove("hidden");
        localStorage.setItem('isSoundModeActive', false);
    } else {
        // activate sound mode
        isSoundModeActive = true;
        soundButtonLabelOn.classList.remove("hidden");
        soundButtonLabelOff.classList.add("hidden");
        localStorage.setItem('isSoundModeActive', true);
    }
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
    } catch (e) { } finally { }
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
    } catch (e) { } finally { }
}


let factor1 = 0;
let factor2 = 0;
let result = 0;
let fractions = new Map()
let startTime;
let endTime;
let autoTaskTimer;
// let recognition;

function validateResult() {
    //currentSolution.disabled = true;
    solution = currentSolution.value
    endTime = performance.now();
    //console.log(endTime);
    wasSolved = true;

    updateViewSolution()

    let interval = getAutoTaskInterval();
    if (0 < interval) {
        autoTaskTimer = setInterval(function () {
            if (!wasSolved || !endTime) {
                clearInterval(autoTaskTimer);
                currentSolution.style.backgroundSize = "0%";
                return
            }
            // Get today's date and time
            let now = performance.now();
            //console.log(now - endTime)
            currentSolution.style.backgroundSize = ((now - endTime) * 125 / interval) + "%";
            if (3000 <= now - endTime && now - endTime < 3010) {
                enterFullscreen();
                hideNav();
                currentSolution.focus();
                window.scrollTo(0, 0);
            }
            if (3000 < now - endTime) {
                // more than 3 seconds are passed (omit fullscreen error)
                if (interval < now - endTime) {
                    newTask(false);
                    clearInterval(autoTaskTimer);
                }
            } else {
                // less than 3 seconds are passed
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

function calculateTask(a, b) {
    a = Math.max(1, a)
    a = Math.min(10, a)
    b = Math.max(1, b)
    b = Math.min(10, b)
    do {
        do {
            factor1 = Math.floor(Math.random() * (10 ** a));
        } while (factor1 < 2 || factor1.toString().length != a);
        do {
            factor2 = Math.floor(Math.random() * (10 ** b));
        } while (factor2 < 2 || factor2.toString().length != b);
    } while (arrayIncludesCombination(lastTasks, factor1, factor2));

    for (let i = 19; i < lastTasks.length; i++) {
        lastTasks.pop();
    }

    lastTasks.unshift([factor1, factor2]);

    result = factor1 * factor2
    startTime = performance.now();
    endTime = null;
}

function arrayIncludesCombination(a, f1, f2) {
    for (let i = 0; i < a.length; i++) {
        let oldTask = a[i];
        if (oldTask[0] == f1 && oldTask[1] == f2) {
            return true;
        }
        if (oldTask[0] == f2 && oldTask[1] == f1) {
            return true;
        }
    }
    return false
}

function updateView() {
    currentTask.innerText = factor1 + " ⋅ " + factor2
    if (isSoundModeActive) {
        let aussage = new SpeechSynthesisUtterance(factor1 + " mal " + factor2);
        window.speechSynthesis.speak(aussage);
    }
    //currentSolution.focus();
}

function updateViewSolution() {
    currentTask.innerHTML = factor1.toString() + " ⋅ " + factor2.toString() + " = <span class='valid'>" + result + " ✓</span>"
    if (isSoundModeActive) {
        let aussage = new SpeechSynthesisUtterance(getRandomElement(successMessages));
        window.speechSynthesis.speak(aussage);
    }
    currentSolution.value = ""
    currentSolution.placeholder = ""
    if (endTime) {
        currentSolution.placeholder = ((endTime - startTime).toFixed(0) / 1000).toString() + " sec."
    }
    //currentSolution.focus();
}

function newTask(setFocus = true) {
    if (setFocus) {
        hideNav();
        currentSolution.focus();
        window.scrollTo(0, 0);
        if (wasSolved && !isVoiceModeActive) {
            enterFullscreen();
        }
    }
    let f1 = parseInt(f1input.value, 10);
    if (isNaN(f1)) {
        f1 = parseInt(f1input.placeholder, 10);
    }
    f1 = f1 % 10;
    let f2 = parseInt(f2input.value, 10);
    if (isNaN(f2)) {
        f2 = parseInt(f2input.placeholder, 10);
    }
    f2 = f2 % 10;
    let f1x = Math.max(1, f1)
    let f2x = Math.max(1, f2)
    if (f1 != f1x) {
        f1input.value = f1x
    }
    if (f2 != f2x) {
        f2input.value = f2x
    }
    localStorage.setItem('f1', f1x)
    localStorage.setItem('f2', f2x)
    f1input.value = f1x;
    f2input.value = f2x;

    isBeginnerModeActive = (f1x == 1 && f2x == 1);
    wasSolved = false;
    clearInterval(autoTaskTimer);

    calculateTask(f1x, f2x)
    updateView()
    resetInput()
    calculateFractions()

    //startDictation();
}

function calculateFractions() {
    fractions = new Map();
    let f1s = factor1.toString();
    let f2s = factor2.toString();

    for (let i = 0; i < f1s.length; i++) {
        let ti = parseInt(f1s[i], 10) * Math.pow(10, f1s.length - i - 1)
        if (ti == 0) {
            continue
        }
        for (let j = 0; j < f2s.length; j++) {
            let tj = parseInt(f2s[j], 10) * Math.pow(10, f2s.length - j - 1);
            if (tj == 0) {
                continue
            }
            fractions.set(ti + "⋅" + tj, ti * tj)
        }
    }
    updateSolution()
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
    keys.sort(function (a, b) {
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
    currentSolution.placeholder = "..."
    if (!isVoiceModeActive) {
        currentSolution.placeholder = "="
    }
    currentSolution.style.backgroundSize = "0%";
    currentTask.classList.remove("valid");
    currentTask.classList.remove("invalid");
    tempSolutions.innerHTML = ""
    //currentSolution.focus();
    currentSolution.disabled = false;
    Solution.style.display = "none";
}

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
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
    let c = parseInt(currentSolution.value, 10)
    let analizationResult = analizeTempSolution(c)
    if (analizationResult == "") {
        tempSolutions.innerHTML = currentSolution.value + " ?<br/>" + tempSolutions.innerHTML
        if (!isVoiceModeActive) {
            currentSolution.placeholder = "="
        }
        if (isSoundModeActive) {
            let aussage = new SpeechSynthesisUtterance(c + " leider nein");
            window.speechSynthesis.speak(aussage);
        }
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
        if (isSoundModeActive) {
            let aussage = new SpeechSynthesisUtterance(c + ", die Richtung stimmt");
            window.speechSynthesis.speak(aussage);
        }
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
    let c = parseInt(currentSolution.value, 10)
    let analizationResult = analizeTempSolution(c)
    if (analizationResult == "") {
        tempSolutions.innerHTML = currentSolution.value + " ?<br/>" + tempSolutions.innerHTML
        if (!isVoiceModeActive) {
            currentSolution.placeholder = "="
        }
        if (isSoundModeActive) {
            let aussage = new SpeechSynthesisUtterance(c + " leider nein");
            window.speechSynthesis.speak(aussage);
        }
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
        if (isSoundModeActive) {
            let aussage = new SpeechSynthesisUtterance(c + ", die Richtung stimmt");
            window.speechSynthesis.speak(aussage);
        }
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

function guessInput() {
    if (isVoiceModeActive) {
        return;
    }
    if (currentSolution.value.length >= result.toString().length) {
        saveTempSolution()
    }
}

function guessVoiceInput(s) {
    if (s.length != result.toString().length) {
        return false;
    }
    let c = parseInt(s, 10);
    if (c == factor1 || c == factor2) {
        return false;
    }
    let analizationResult = analizeTempSolution(c);
    if (c == result) {
        currentSolution.value = s;
        saveTempSolution();
        currentSolution.placeholder = "...";
        return true;
    }
    return false;
}

function analizeTempSolution(s) {
    if (isBeginnerModeActive) {
        let keys = sumFlat(s)
        return keys.join("+")
    }
    let keys = sumRecursive(0, 0, s)
    return keys.join("+")
}

function sumRecursive(i, c, s) {
    let keys = Array.from(fractions.keys());
    for (let j = i; j < keys.length; j++) {
        let newCurrent = c + fractions.get(keys[j]);
        if (newCurrent > s) {
            continue
        }
        if (newCurrent == s) {
            return [keys[j]]
        }
        let tempResult = sumRecursive(j + 1, newCurrent, s)
        if (0 < tempResult.length) {
            tempResult.push(keys[j])
            return tempResult
        }
    }
    return []
}

function sumFlat(s) {
    let keys = Array();
    let tempSum = 0;
    for (let i = 1; i <= factor1; i++) {
        keys.push(factor2)
        tempSum += factor2;
        if (tempSum == s) {
            if (i == 1) {
                return ["1⋅" + factor2.toString()]
            }
            return [i.toString() + "⋅" + factor2.toString() + " = " + keys.join("+")]
        }
    }
    keys = Array();
    tempSum = 0;
    for (let j = 1; j <= factor2; j++) {
        keys.push(factor1)
        tempSum += factor1;
        if (tempSum == s) {
            if (j == 1) {
                return ["1⋅" + factor1.toString()]
            }
            return [j.toString() + "⋅" + factor1.toString() + " = " + keys.join("+")]
        }
    }
    return []
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

let recognition;

function startDictation() {

    if (!isVoiceModeActive) {
        return;
    }

    if (window.hasOwnProperty('webkitSpeechRecognition')) {

        //if (typeof recognition === 'undefined' || recognition === null) {
        recognition = new webkitSpeechRecognition();
        //}

        // recognition.stop();

        recognition.continuous = true;
        recognition.interimResults = true;



        recognition.lang = "de-DE";
        // recognition.lang = "en-US";
        recognition.start();

        recognition.onstart = function () {
            console.log("start recognition");
            currentSolution.placeholder = "...";
        }

        recognition.onresult = function (e) {
            console.log(e.results);
            currentSolution.placeholder = e.results[e.results.length - 1][0].transcript.trim();

            if (e.results[e.results.length - 1][0].transcript.trim() == "stop") {
                toggleVoiceMode();
            }

            if (e.results[e.results.length - 1].isFinal) {
                if (["neue Aufgabe", "neu", "next", "weiter"].includes(e.results[e.results.length - 1][0].transcript.trim())) {
                    newTask(false);
                    return;
                }
                if (!wasSolved) {
                    let c = parseInt(e.results[e.results.length - 1][0].transcript.replace("Uhr", "").trim(), 10);
                    if (c) {
                        if (c != factor1 && c !== factor2) {
                            currentSolution.value = c;
                            saveTempSolution();
                        }
                        currentSolution.placeholder = "...";
                        console.log("ok.. dictation restart");
                        recognition.stop();
                    }
                }
            } else {
                let input = e.results[e.results.length - 1][0].transcript.replace("Uhr", "");
                input = input.replace("/", " ");
                let parts = input.split(" ");
                for (let i = 0; i < parts.length; i++) {
                    console.log(parts[i]);
                    if (guessVoiceInput(parts[i])) {
                        console.log("ok.. dictation restart");
                        recognition.stop();
                        break;
                    }
                    console.log("invalid");
                }
            }
        };

        recognition.onerror = function (e) {
            currentSolution.placeholder = "🙉";
            console.log("uppps.. dictation interrupted");
            recognition.stop();
        }

        recognition.onend = function (e) {
            currentSolution.placeholder = "🙉";
            console.log("dictation finished");
            startDictation();
        }

    }
}