import * as appVoice from '../bunchrunner/SUI/voice.js'

export let currentTask;
export let f1input;
export let f2input;
export let navigation;
export let Solution;
export let psolutions;

export let SolutionTask;
export let trainerPage;
export let header;

export let funnySmilies = ["😋", "😛", "😜", "🤪", "😝", "🤗", "🤭", "🤫", "🤨", "😏", "🤯", "🤠", "🥳", "😎", "🤓", "🧐", "😲", "😳", "🥺", "😱", "😈", "😺", "😸", "😹", "😻", "😼", "😽", "🙀"];

export function formatNumberForDisplay(n) {
    if (!n) {
        return ""
    }
    return n.toString().replace(".", ",");
}

export function init() {
    currentTask = document.getElementById('current-task');
    f1input = document.getElementById('f1')
    f2input = document.getElementById('f2')
    navigation = document.getElementById('nav')
    Solution = document.getElementById('Solution')
    psolutions = document.getElementById('partial-solutions')

    SolutionTask = document.getElementById('Solution-task')
    trainerPage = document.getElementById('trainer-page')
    header = document.getElementById('header')

    window.addEventListener("keydown", function(e) {

        if (e.keyCode == '78') {
            // n
            window.dispatchEvent(new CustomEvent('bunch-request-next-task'))
        } else if (e.keyCode == '83') {
            // s              
            // appPage.toggleSolution();
        } else if (e.keyCode == '79') {
            // o
            appPage.clickNavPage();
        } else if (e.keyCode == '70') {
            // f
            appPage.toggleFullScreen();
        } else if (e.keyCode == '86') {
            // V
            appPage.enterFullscreen();
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
}