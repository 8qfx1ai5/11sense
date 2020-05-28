let historyList;

function pushToStatistics(f1, f2, result, time) {
    let entry = document.createElement('li');
    let content = document.createElement('span');
    content.appendChild(document.createTextNode(f1 + " x " + f2 + " = " + result + " (time: " + (time / 1000).toPrecision(4) + " sec.)"));
    entry.appendChild(content);
    historyList.prepend(entry);
}