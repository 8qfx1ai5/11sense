let settingsImage;
let headerMain;

function toggleNav() {
    if (navigation.classList.contains("hidden")) {
        showNav();
    } else {
        hideNav();
    }
}

function showNav(action = false) {
    if (action) {
        navigation.classList.remove("hidden");
        hideSolution();
        settingsImage.classList.remove("inactive-page-icon");
        if (screen.width < 1100) {
            hideMainPage(true);
        }
        navigation.focus();
    } else {
        window.location.assign("#nav");
    }
}

function hideNav(action = false) {
    if (action) {
        navigation.classList.add("hidden")
        settingsImage.classList.add("inactive-page-icon");
    } else {
        window.location.replace('#');
    }
}

function backToMainPage(action = false) {
    if (action) {
        showMainPage(true);
        hideNav(true);
    } else {
        window.location.replace('#');
    }
}

function showMainPage(action = true) {
    if (action) {
        headerMain.classList.remove("inactive-page-icon");
        currentSolution.focus();
    }
}

function hideMainPage(action = true) {
    if (action) {
        headerMain.classList.add("inactive-page-icon");
        currentSolution.blur();
    }
}