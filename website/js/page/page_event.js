(function() {
    settingsImage = document.getElementById("settings-image");
    headerMain = document.getElementById("header-main");

    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchmove', handleTouchMove, false);

    window.addEventListener('popstate', function(e) {
        if (isDesktopMode()) {
            return;
        }
        isDebugMode && console.log("current location hash: '" + window.location.hash + "'");

        switch (window.location.hash) {
            case "":
                backToMainPage();
                break;
            case "#nav":
                showNav();
                break;
        }
    });

})();


var xDown = null;
var yDown = null;

function getTouches(evt) {
    return evt.touches // browser API
}

function handleTouchStart(evt) {
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
            clickNavPage();
        } else {
            clickMainPage();
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