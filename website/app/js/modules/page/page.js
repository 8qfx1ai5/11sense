import * as appSystem from '../main/system.js'
import * as Main from '../main/main.js';

let settingsImage;
let statsImage;
let headerMain;
let stats;
export let tagIdDisplaySelector = "display-selector";
export let tagIdSettingsSelector = "settings-selector";
let tagIdHeaderRight = "header-right"
let tagIdHeaderLeft = "header-left"
let tagIdMainPage = "trainer-page"

export function isDesktopMode() {
    return 1300 <= screen.width
}

function switchToNextRightPage() {
    let allSubpages = getRegisteredDisplaySubpages().concat([""]).concat(getRegisteredSettingsSubpages())
    let currentSubpageIndex = allSubpages.indexOf(window.location.hash.substr(1))
    if (currentSubpageIndex == allSubpages.length - 1) {
        return
    }
    window.location.assign("#" + allSubpages[currentSubpageIndex + 1]);
}

function switchToNextLeftPage() {
    let allSubpages = getRegisteredDisplaySubpages().concat([""]).concat(getRegisteredSettingsSubpages())
    let currentSubpageIndex = allSubpages.indexOf(window.location.hash.substr(1))
    if (currentSubpageIndex == 0) {
        return
    }
    window.location.assign("#" + allSubpages[currentSubpageIndex - 1]);
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
    document.getElementById(tagIdMainPage).classList.remove("hidden");
    // Main.currentSolution.focus();
}

function hideMainPage() {
    headerMain.classList.add("inactive-page-icon");
    document.getElementById(tagIdMainPage).classList.add("hidden");
    // Main.currentSolution.blur();
}

function clickMainPage() {
    document.getElementById('mainPageTrigger').click();
}

export function onClickMainPage() {
    if (!isDesktopMode()) {
        setMainPageLocation();
    } else {
        showMainPage();
    }
}

function setMainPageLocation() {
    appSystem.log("set main page location", 1);
    window.location.replace('#');
}

// all about nav page

function isNavPageActive() {
    return !document.getElementById(tagIdHeaderRight).classList.contains("inactive-page-icon");
}

export function toggleNav() {
    if (isNavPageActive()) {
        hideNav();
    } else {
        showNav();
    }
}

function showNav(subpage = "settings-basic") {
    Main.navigation.classList.remove("hidden");
    hideSolution();
    document.getElementById(tagIdHeaderRight).classList.remove("inactive-page-icon");
    if (!isDesktopMode()) {
        hideMainPage();
        hideStats();
    }
    Main.navigation.focus();
    changeSettingsSubpageTo(subpage);
}

function hideNav() {
    Main.navigation.classList.add("hidden");
    document.getElementById(tagIdHeaderRight).classList.add("inactive-page-icon");
}

export function clickNavPage() {
    document.getElementById(tagIdHeaderRight).click();
}

export function onClickNavPage() {
    if (isDesktopMode()) {
        toggleNav();
    }
    setNavPageLocation();
}

export function setNavPageLocation() {
    appSystem.log("set nav page location", 1);
    if (isDesktopMode()) {
        let currentSubpages = []
        let dispaySelector = document.getElementById(tagIdDisplaySelector)
        if (dispaySelector.value && isStatsPageActive()) {
            currentSubpages.push(dispaySelector.value)
        }
        let settingsSelector = document.getElementById(tagIdSettingsSelector)
        if (settingsSelector.value && isNavPageActive()) {
            currentSubpages.push(settingsSelector.value)
        }
        window.location.assign("#" + currentSubpages.join("/"));
    } else {
        let settingsSelector = document.getElementById(tagIdSettingsSelector)
        window.location.assign("#" + settingsSelector.value);
    }
}

// all about stats page

function isStatsPageActive() {
    return !document.getElementById(tagIdHeaderLeft).classList.contains("inactive-page-icon");
}

export function setStatsPageLocation() {
    appSystem.log("set stats page location", 1);
    if (isDesktopMode()) {
        let currentSubpages = []
        let dispaySelector = document.getElementById(tagIdDisplaySelector)
        if (dispaySelector.value && isStatsPageActive()) {
            currentSubpages.push(dispaySelector.value)
        }
        let settingsSelector = document.getElementById(tagIdSettingsSelector)
        if (settingsSelector.value && isNavPageActive()) {
            currentSubpages.push(settingsSelector.value)
        }
        window.location.assign("#" + currentSubpages.join("/"));
    } else {
        let dispaySelector = document.getElementById(tagIdDisplaySelector)
        window.location.assign("#" + dispaySelector.value);
    }
}

function toggleStats() {
    if (isStatsPageActive()) {
        hideStats();
    } else {
        showStats();
    }
}

function showStats(subpage = "stats-history") {
    stats.classList.remove("hidden");
    hideSolution();
    document.getElementById(tagIdHeaderLeft).classList.remove("inactive-page-icon");
    if (!isDesktopMode()) {
        hideMainPage();
        hideNav();
    }
    stats.focus();
    changeDisplaySubpageTo(subpage);
}

function hideStats() {
    stats.classList.add("hidden")
    document.getElementById(tagIdHeaderLeft).classList.add("inactive-page-icon");
}

function clickStatsPage() {
    document.getElementById(tagIdHeaderLeft).click();
}

export function onClickStatsPage() {
    if (isDesktopMode()) {
        toggleStats();
    }
    setStatsPageLocation();
}

// all about solution pages

export function toggleSolution() {
    if (Main.Solution.style.display === "none") {
        showSolution()
    } else {
        hideSolution()
            // Main.currentSolution.focus();
    }
}

function showSolution() {
    Main.Solution.style.display = "block";
    hideNav();
    Main.Solution.focus();
}

function hideSolution() {
    Main.Solution.style.display = "none";
}

// all about fullscreen

export function toggleFullScreen() {
    let element = document.documentElement
    if (!document.fullscreen && !document.mozFullScreen && !document.webkitFullScreen && !document.msRequestFullscreen) {
        enterFullscreen()
    } else {
        exitFullscreen()
    }
    hideNav();
    // Main.currentSolution.focus();
}

export function enterFullscreen() {
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

function handlePageStatus() {
    appSystem.log("new location hash: '" + window.location.hash + "'", 1);

    if (window.location.hash == "") {
        backToMainPage();
        return;
    }
    let currentSubpages = window.location.hash.substr(1).split("/")
    currentSubpages.forEach(function(page) {
        if (page.startsWith("settings-")) {
            showNav(page);
        } else if (page.startsWith("stats-")) {
            showStats(page);
        }
    })

    setSubpageHeight()
    setTrainerPageHeight()
}

// set page height on subpages, to omit page scroll bar
function setSubpageHeight() {
    let subpages = document.getElementsByClassName("subpage")
    let h2s = document.querySelectorAll("#content > div > h2")
    let topOffset = 0

    // get maximum height of all subpage headers for the offset
    for (var j = 0; j < h2s.length; j++) {
        topOffset = Math.max(topOffset, h2s[j].getBoundingClientRect().height)
    }
    // add global header height to the offset
    topOffset += document.getElementById("header").getBoundingClientRect().height
    for (var i = 0; i < subpages.length; i++) {
        subpages[i].style.height = (window.visualViewport.height - topOffset) + "px"
    }
}

function setTrainerPageHeight() {
    let topOffset = document.getElementById("header").getBoundingClientRect().height
    document.getElementById("trainer-page").style.height = (window.visualViewport.height - topOffset) + "px"
}

var xDown = null;
var yDown = null;

function getTouches(evt) {
    return evt.touches // browser API
}

function handleTouchStart(evt) {
    if (isDesktopMode()) {
        return;
    }
    const firstTouch = getTouches(evt)[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
};

function handleTouchMove(evt) {
    if (!xDown || !yDown) {
        return;
    }

    var xUp = evt.touches[0].clientX;
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) { /*most significant*/
        if (xDiff > 25) {
            /* left swipe */
            switchToNextRightPage();
        } else if (-25 < xDiff) {
            /* right swipe */
            switchToNextLeftPage();
        }
    } else {
        if (yDiff > 0) {
            /* up swipe */
        } else {
            /* down swipe */
        }
    }
    /* reset values */
    xDown = null;
    yDown = null;
};

export function init() {
    settingsImage = document.getElementById("settings-image");
    statsImage = document.getElementById("stats-image");
    headerMain = document.getElementById("header-main");
    stats = document.getElementById("stats");

    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchmove', handleTouchMove, false);

    window.addEventListener('popstate', function(e) {
        handlePageStatus()
    });

    document.getElementById('Solution').addEventListener('click', toggleSolution)
    document.getElementById('mainPageTrigger').addEventListener('click', onClickMainPage)
    document.getElementById('mainPageTriggerSubheadding').addEventListener('click', onClickMainPage)
    document.getElementById('header-right').addEventListener('click', onClickNavPage)
    document.getElementById('header-left').addEventListener('click', onClickStatsPage)
    document.getElementById(tagIdSettingsSelector).addEventListener('change', setNavPageLocation)
    document.getElementById(tagIdDisplaySelector).addEventListener('change', setStatsPageLocation)
    window.addEventListener('resize', setSubpageHeight)
    window.addEventListener('resize', setTrainerPageHeight)
    window.addEventListener('load', setTrainerPageHeight)

    handlePageStatus()
}

// subpage stuff

function getRegisteredDisplaySubpages() {
    let output = []
    Array.prototype.forEach.call(document.getElementById(tagIdDisplaySelector).options, function(element) {
        if (!element.classList.contains('hidden')) {
            output.unshift(element.value)
        }
    });
    return output
}

function getRegisteredSettingsSubpages() {
    let output = []
    Array.prototype.forEach.call(document.getElementById(tagIdSettingsSelector).options, function(element) {
        if (!element.classList.contains('hidden')) {
            output.push(element.value)
        }
    });
    return output
}

// all about the display page

function changeDisplaySubpageTo(targetpage = "stats-history") {
    appSystem.log("change display subpage to '" + targetpage + "'", 1);
    document.getElementById(tagIdDisplaySelector).value = targetpage
    let hasPageFound = false
    getRegisteredDisplaySubpages().forEach(subpage => {
        if (targetpage == subpage) {
            let subpageElement = document.getElementById(subpage);
            subpageElement.classList.remove("hidden");
            hasPageFound = true
        } else {
            let subpageElement = document.getElementById(subpage);
            subpageElement.classList.add("hidden");
        }
    });
    if (!hasPageFound) {
        appSystem.log("subpage not found '" + targetpage + "'", 2);
        changeDisplaySubpageTo()
    }
}

// all about the settings page

function changeSettingsSubpageTo(targetpage = "settings-basic") {
    appSystem.log("change settings subpage to '" + targetpage + "'", 1);
    document.getElementById(tagIdSettingsSelector).value = targetpage
    let hasPageFound = false
    getRegisteredSettingsSubpages().forEach(subpage => {
        if (targetpage == subpage) {
            let subpageElement = document.getElementById(subpage);
            subpageElement.classList.remove("hidden");
            hasPageFound = true

        } else {
            let subpageElement = document.getElementById(subpage);
            subpageElement.classList.add("hidden");
        }
    });
    if (!hasPageFound) {
        appSystem.log("subpage not found '" + targetpage + "'", 2);
        changeSettingsSubpageTo()
    }
}