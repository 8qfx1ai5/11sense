import * as Main from '../main/main.js'

let historyList;
let historyLocalStorageKey = "resultHistory";

export function pushToStatistics(f1, f2, result, time, now = new Date()) {
    let date = now.getDate() + "." + now.getMonth() + "." + now.getFullYear();
    let eclapesTime = (time / 1000).toPrecision(4);

    saveInLocalStorage([f1, f2, result, eclapesTime, date]);

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
        let entry = document.createElement('li');
        let content = document.createElement('span');
        let date = resultHistory[i][4];
        let eclapesTime = resultHistory[i][3];
        let r = resultHistory[i][2];
        let f2 = resultHistory[i][1];
        let f1 = resultHistory[i][0];
        content.appendChild(document.createTextNode(Main.formatNumberForDisplay(f1) + " ⋅ " + Main.formatNumberForDisplay(f2) + " = " + Main.formatNumberForDisplay(r) + " (time: " + Main.formatNumberForDisplay(eclapesTime) + " sec. | date: " + date + ")"));
        entry.appendChild(content);
        historyList.append(entry);
    }
}

export function init() {
    historyList = document.getElementById("history-list");

    updateHistoryBasedOnLocalStorage();
}