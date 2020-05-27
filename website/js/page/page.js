let settingsImage;
let headerMain;

function isDesktopMode() {
    return 1100 <= screen.width
}

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

function hideNav(action = false) {
    navigation.classList.add("hidden")
    settingsImage.classList.add("inactive-page-icon");
}

function backToMainPage() {
    showMainPage();
    hideNav();
}

function showMainPage() {
    headerMain.classList.remove("inactive-page-icon");
    currentSolution.focus();
}

function hideMainPage() {
    headerMain.classList.add("inactive-page-icon");
    currentSolution.blur();
}

function clickMainPage() {
    document.getElementById('mainPageTrigger').click();
}

function clickNavPage() {
    document.getElementById('header-right').click();
}

function onClickMainPage() {
    if (!isDesktopMode()) {
        setMainPageLocation();
    }
}

function onClickNavPage() {
    if (isDesktopMode()) {
        toggleNav();
    } else {
        setNavPageLocation();
    }
}

function setMainPageLocation() {
    log("set main page location", 3);
    window.location.replace('#');
}

function setNavPageLocation() {
    log("set nav page location", 3);
    window.location.assign("#nav");
}