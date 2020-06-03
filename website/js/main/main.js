let currentTask;
let currentSolution;
let f1input;
let f2input;
let navigation;
let Solution;
let psolutions;

let SolutionTask;
let autoTaskSelector;
let trainerPage;
let header;

let isBeginnerModeActive = false;
let wasSolved = false;
let funnySmilies = ["😋", "😛", "😜", "🤪", "😝", "🤗", "🤭", "🤫", "🤨", "😏", "🤯", "🤠", "🥳", "😎", "🤓", "🧐", "😲", "😳", "🥺", "😱", "😈", "😺", "😸", "😹", "😻", "😼", "😽", "🙀"];

// let recognition;

function guessInput() {
    if (appVoice.isActive) {
        return;
    }
    if (currentSolution.value.length >= result.toString().length) {
        processInput()
    }
}

function formatNumberForDisplay(n) {
    return n.toString().replace(".", ",");
}

function processInput() {
    // if (wasSolved && !appVoice.isActive) {
    //     newTask();
    //     return;
    // }

    currentSolution.focus();
    if (currentSolution.value == "") {
        // if (!appVoice.isActive) {
        //     let smiley;
        //     do {
        //         smiley = getRandomElement(funnySmilies);
        //     } while (currentSolution.placeholder == smiley);
        //     currentSolution.placeholder = smiley;
        // }

        return
    }
    let c = parseFloat(currentSolution.value.replace(",", "."))
    let analizationResult = analizeTempSolution(c)
    if (analizationResult == "") {
        // if (!appVoice.isActive) {
        //     currentSolution.placeholder = "="
        // }
        system.events.dispatchEvent(new CustomEvent('no-solution-found', {
            detail: {
                input: c,
                expected: result,
                parts: analizationResult
            }
        }));
    } else if (c == result) {
        system.events.dispatchEvent(new CustomEvent('solution-found', {
            detail: {
                input: c,
                expected: result,
                parts: analizationResult
            }
        }));
    } else {
        let x = c * 100 / result
        currentSolution.placeholder = x.toFixed(1) + "%";
        system.events.dispatchEvent(new CustomEvent('partial-solution-found', {
            detail: {
                input: c,
                expected: result,
                parts: analizationResult
            }
        }));
    }
    currentSolution.value = "";
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