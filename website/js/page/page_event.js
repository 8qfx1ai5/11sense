(function() {
    settingsImage = document.getElementById("settings-image");
    statsImage = document.getElementById("stats-image");
    headerMain = document.getElementById("header-main");
    stats = document.getElementById("stats");

    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchmove', handleTouchMove, false);

    window.addEventListener('popstate', function(e) {
        handlePageStatus()
    });

    handlePageStatus()
})();

function handlePageStatus() {
    if (isDesktopMode()) {
        return;
    }
    log("new location hash: '" + window.location.hash + "'", 1);

    if (window.location.hash == "") {
        backToMainPage();
    } else if (window.location.hash.startsWith("#settings-")) {
        showNav(window.location.hash.substr(1));
    } else if (window.location.hash.startsWith("#stats-")) {
        showStats(window.location.hash.substr(1));
    } else {
        window.location.replace('#');
    }
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
        if (xDiff > 0) {
            /* left swipe */
            switchToNextRightPage();
        } else {
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