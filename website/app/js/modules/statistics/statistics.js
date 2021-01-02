import * as Main from '../main/main.js'
import State from '../bunchrunner/State.js'
import * as appTranslation from '../language/translation.js'

let historyList;
let historyLocalStorageKey = "resultHistoryV2";

/**
 * analyze a completed task and store the results in the local storage
 * @param {State} state 
 */
export function pushToStatistics(state) {
    saveInLocalStorage(state);

    updateHistoryBasedOnLocalStorage();
}

function getHistoryFromLocalStorage() {
    let resultHistory = localStorage.getItem(historyLocalStorageKey);
    if (!resultHistory) {
        resultHistory = [];
    } else {
        resultHistory = JSON.parse(resultHistory)
    }
    return resultHistory;
}

function saveInLocalStorage(a) {
    let resultHistory = getHistoryFromLocalStorage();
    resultHistory.push(a);
    localStorage.setItem(historyLocalStorageKey, JSON.stringify(resultHistory));
}

function updateHistoryBasedOnLocalStorage() {
    historyList.innerHTML = "";
    let resultHistory = getHistoryFromLocalStorage();
    for (let i = resultHistory.length - 1; 0 <= i; i--) {
        let state = resultHistory[i]
        let entry = document.createElement('li');
        let content = document.createElement('span');
        let date = new Date(state.date)
        const options = { year: '2-digit', month: '2-digit', day: '2-digit' };
        // TODO: handle translation for the date (race-condition with google translate)
        // let dateFormated = date.toLocaleDateString(appTranslation.getSelectedLanguage(), options);
        let dateFormated = date.toLocaleDateString("de-DE", options);
        let eclapesTime = ((state.endTime - state.startTime) / 1000).toPrecision(4);;
        let type = state.taskList[0].type
        let valid = 0
        for (let j = 0; j < state.taskList.length; j++) {
            if (state.taskList[j].isSolved && !state.taskList[j].wasPaused) {
                valid++
            }
        }
        let text = valid + "/" + state.taskList.length + " \"" + type + "\" ( " + Main.formatNumberForDisplay(eclapesTime) + " sec. - " + dateFormated + " )"
        content.appendChild(document.createTextNode(text));
        entry.appendChild(content);
        historyList.append(entry);
    }
}

export function init() {
    historyList = document.getElementById("history-list");

    updateHistoryBasedOnLocalStorage();

    window.addEventListener('bunch-action-submit', function(e) {
        pushToStatistics(e.detail.state)
    })
}