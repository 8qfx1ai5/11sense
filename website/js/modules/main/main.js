import * as appMath from '../math/math.js'
import { appVoice } from '../conversation/voice.js'
import * as appSystem from '../main/system.js'

export let currentTask;
export let currentSolution;
export let f1input;
export let f2input;
export let navigation;
export let Solution;
export let psolutions;

export let SolutionTask;
export let trainerPage;
export let header;

export let funnySmilies = ["😋", "😛", "😜", "🤪", "😝", "🤗", "🤭", "🤫", "🤨", "😏", "🤯", "🤠", "🥳", "😎", "🤓", "🧐", "😲", "😳", "🥺", "😱", "😈", "😺", "😸", "😹", "😻", "😼", "😽", "🙀"];

export function guessInput() {
    if (appVoice.isActive) {
        return;
    }
    if (currentSolution.value.length >= appMath.result.toString().length) {
        processInput()
    }
}

export function formatNumberForDisplay(n) {
    return n.toString().replace(".", ",");
}

export function processInput() {

    currentSolution.focus();
    if (currentSolution.value == "") {

        return
    }
    let c = parseFloat(currentSolution.value.replace(",", "."))
    let analizationResult = analizeTempSolution(c)
    if (analizationResult == "") {
        // if (!appVoice.isActive) {
        //     currentSolution.placeholder = "="
        // }
        appSystem.events.dispatchEvent(new CustomEvent('no-solution-found', {
            detail: {
                input: c,
                expected: appMath.result,
                parts: analizationResult
            }
        }));
    } else if (c == appMath.result) {
        appSystem.events.dispatchEvent(new CustomEvent('solution-found', {
            detail: {
                input: c,
                expected: appMath.result,
                parts: analizationResult
            }
        }));
    } else {
        let x = c * 100 / appMath.result
        currentSolution.placeholder = x.toFixed(1) + "%";
        appSystem.events.dispatchEvent(new CustomEvent('partial-solution-found', {
            detail: {
                input: c,
                expected: appMath.result,
                parts: analizationResult
            }
        }));
    }
    currentSolution.value = "";
}

export function isBeginnerModeActive() {
    return (appMath.factor1 == 1 && appMath.factor2 == 1);
}

export function analizeTempSolution(s) {
    let keys = [];
    if (isBeginnerModeActive()) {
        keys = appMath.sumFlat(s)
    } else {
        keys = appMath.sumRecursive(0, 0, s)
    }
    for (let i = 0; i < keys.length; i++) {
        keys[i] = keys[i].replace(/[.]/g, ",");
    }
    return keys.join("+")
}

export function init() {
    currentTask = document.getElementById('current-task');
    currentSolution = document.getElementById('solution');
    f1input = document.getElementById('f1')
    f2input = document.getElementById('f2')
    navigation = document.getElementById('nav')
    Solution = document.getElementById('Solution')
    psolutions = document.getElementById('partial-solutions')

    SolutionTask = document.getElementById('Solution-task')
    trainerPage = document.getElementById('trainer-page')
    header = document.getElementById('header')

    window.addEventListener("keydown", function(e) {

        if (e.keyCode == '13' || e.keyCode == '32') {
            // enter or space
            processInput();
        } else if (e.keyCode == '78') {
            // n
            appMath.newTask();
        } else if (e.keyCode == '83') {
            // s              
            appPage.toggleSolution();
            currentSolution.focus();
        } else if (e.keyCode == '79') {
            // o
            appPage.clickNavPage();
        } else if (e.keyCode == '70') {
            // f
            appPage.toggleFullScreen();
            currentSolution.focus();
        } else if (e.keyCode == '86') {
            // V
            toggleVoiceMode();
            appPage.enterFullscreen();
            currentSolution.focus();
        }
    });

    if (localStorage.getItem('f1')) {
        f1input.value = localStorage.getItem('f1');
    }
    if (localStorage.getItem('f2')) {
        f2input.value = localStorage.getItem('f2');
    }

    f1input.addEventListener('input', function() {
        appMath.newTask(false)
    })
    f2input.addEventListener('input', function() {
        appMath.newTask(false)
    })
    currentTask.addEventListener('click', function() {
        appMath.newTask()
    })
    document.getElementById('button-feedback').addEventListener('click', function() {
        window.open('https://paypal.me/pools/c/8pfcrOnyif')
    })

    currentSolution.focus();
}