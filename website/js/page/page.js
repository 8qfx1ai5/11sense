let settingsImage;
let headerMain;

function toggleNav() {
    if (navigation.classList.contains("hidden")) {
        showNav();
    } else {
        hideNav();
    }
}

function showNav() {
    navigation.classList.remove("hidden");
    hideSolution();
    settingsImage.classList.remove("inactive-page-icon");
    if (screen.width < 1100) {
        hideMainPage();
    }
    navigation.focus();
}

function hideNav() {
    navigation.classList.add("hidden")
    settingsImage.classList.add("inactive-page-icon");
    if (screen.width < 1100) {
        showMainPage();
    }
}

function backToMainPage() {
    showMainPage();
    if (screen.width < 1100) {
        hideNav();
    }
}

function showMainPage() {
    headerMain.classList.remove("inactive-page-icon");
    currentSolution.focus();
}

function hideMainPage() {
    headerMain.classList.add("inactive-page-icon");
    currentSolution.blur();
}