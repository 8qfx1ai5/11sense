import * as appVoice from '../bunchrunner/SUI/voice.js'

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
    window.dispatchEvent(new CustomEvent('bunch-request-possible-solution-input', {
        detail: {
            input: currentSolution.value,
            taskIndex: currentSolution.getAttribute("taskindex"),
        }
    }))
}

export function formatNumberForDisplay(n) {
    if (!n) {
        return ""
    }
    return n.toString().replace(".", ",");
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
            window.dispatchEvent(new CustomEvent('bunch-request-solution-input', {
                detail: {
                    input: currentSolution.value,
                    taskIndex: currentSolution.getAttribute("taskindex"),
                }
            }))
        } else if (e.keyCode == '78') {
            // n
            window.dispatchEvent(new CustomEvent('bunch-request-next-task'))
        } else if (e.keyCode == '83') {
            // s              
            // appPage.toggleSolution();
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
        window.dispatchEvent(new CustomEvent('bunch-request-new'))
    })
    f2input.addEventListener('input', function() {
        window.dispatchEvent(new CustomEvent('bunch-request-new'))
    })

    document.getElementById('button-feedback').addEventListener('click', function() {
        window.open('https://paypal.me/pools/c/8pfcrOnyif')
    })

    currentSolution.focus();
}