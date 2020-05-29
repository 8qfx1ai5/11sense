let registeredDisplaySubpages = ["history", "loggings"]

function changeDisplaySubpage() {
    let selectionObject = document.getElementById(displaySelectorId);
    let currentSelection = selectionObject.value;
    log("change display subpage to '" + currentSelection + "'", 2);
    let pageFound = false;
    registeredDisplaySubpages.forEach(subpage => {
        if (currentSelection == subpage) {
            window["show" + subpage.charAt(0).toUpperCase() + subpage.slice(1) + "Subpage"]();
            pageFound = true;
        } else {
            window["hide" + subpage.charAt(0).toUpperCase() + subpage.slice(1) + "Subpage"]();
        }
    });
    if (!pageFound) {
        showHistorySubpage();
    }
}

function showHistorySubpage() {
    log("showHistorySubpage()", 1);
    let subpage = document.getElementById("history");
    subpage.classList.remove("hidden");
}

function hideHistorySubpage() {
    log("hideHistorySubpage()", 1);
    let subpage = document.getElementById("history");
    subpage.classList.add("hidden");
}

function showLoggingsSubpage() {
    log("showLoggingsSubpage()", 1);
    let subpage = document.getElementById("loggings");
    subpage.classList.remove("hidden");
}

function hideLoggingsSubpage() {
    log("hideLoggingsSubpage()", 1);
    let subpage = document.getElementById("loggings");
    subpage.classList.add("hidden");
}