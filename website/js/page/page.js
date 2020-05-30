let settingsImage;
let statsImage;
let headerMain;
let stats;
let displaySelectorId = "display-selector";
let tagIdHeaderRight = "header-right"
let tagIdHeaderLeft = "header-left"

function isDesktopMode() {
    return 1100 <= screen.width
}

// all about main page

function backToMainPage() {
    showMainPage();
    hideNav();
    hideStats();
}

function isMainPageActive() {
    return !headerMain.classList.contains("inactive-page-icon");
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

function onClickMainPage() {
    if (!isDesktopMode()) {
        setMainPageLocation();
    }
}

function setMainPageLocation() {
    log("set main page location", 1);
    window.location.replace('#');
}

// all about nav page

function isNavPageActive() {
    return !document.getElementById(tagIdHeaderRight).classList.contains("inactive-page-icon");
}

function toggleNav() {
    if (isNavPageActive()) {
        hideNav();
    } else {
        showNav();
    }
}

function showNav() {
    navigation.classList.remove("hidden");
    hideSolution();
    document.getElementById(tagIdHeaderRight).classList.remove("inactive-page-icon");
    if (!isDesktopMode()) {
        hideMainPage();
        hideStats();
    }
    navigation.focus();
}

function hideNav() {
    navigation.classList.add("hidden");
    document.getElementById(tagIdHeaderRight).classList.add("inactive-page-icon");
}

function clickNavPage() {
    document.getElementById(tagIdHeaderRight).click();
}

function onClickNavPage() {
    if (isDesktopMode()) {
        toggleNav();
    } else {
        setNavPageLocation();
    }
}

function setNavPageLocation() {
    log("set nav page location", 1);
    window.location.assign("#nav");
}

// all about stats page

function isStatsPageActive() {
    return !document.getElementById(tagIdHeaderLeft).classList.contains("inactive-page-icon");
}

function setStatsPageLocation() {
    log("set stats page location", 1);
    window.location.assign("#stats");
}

function toggleStats() {
    if (isStatsPageActive()) {
        hideStats();
    } else {
        showStats();
    }
}

function showStats() {
    stats.classList.remove("hidden");
    hideSolution();
    document.getElementById(tagIdHeaderLeft).classList.remove("inactive-page-icon");
    if (!isDesktopMode()) {
        hideMainPage();
        hideNav();
    }
    stats.focus();
}

function hideStats() {
    stats.classList.add("hidden")
    document.getElementById(tagIdHeaderLeft).classList.add("inactive-page-icon");
}

function clickStatsPage() {
    document.getElementById(tagIdHeaderLeft).click();
}

function onClickStatsPage() {
    if (isDesktopMode()) {
        toggleStats();
    } else {
        setStatsPageLocation();
    }
}

// all about solution pages

function toggleSolution() {
    if (Solution.style.display === "none") {
        showSolution()
    } else {
        hideSolution()
        currentSolution.focus();
    }
}

function showSolution() {
    Solution.style.display = "block";
    hideNav();
    Solution.focus();
}

function hideSolution() {
    Solution.style.display = "none";
}

// all about fullscreen

function toggleFullScreen() {
    let element = document.documentElement
    if (!document.fullscreen && !document.mozFullScreen && !document.webkitFullScreen && !document.msRequestFullscreen) {
        enterFullscreen()
    } else {
        exitFullscreen()
    }
    hideNav();
    currentSolution.focus();
}

function enterFullscreen() {
    // try {
    //     let element = document.documentElement
    //     if (element.requestFullscreen) {
    //         element.requestFullscreen();
    //     } else if (element.mozRequestFullScreen) {
    //         element.mozRequestFullScreen();
    //     } else if (element.webkitRequestFullscreen) {
    //         element.webkitRequestFullscreen();
    //     } else if (element.msRequestFullscreen) {
    //         element.msRequestFullscreen();
    //     }
    // } catch (e) {} finally {}
}

function exitFullscreen() {
    try {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    } catch (e) {} finally {}
}