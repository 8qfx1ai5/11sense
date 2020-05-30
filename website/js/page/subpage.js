let registeredDisplaySubpages = ["history", "loggings"];
let registeredSettingsSubpages = ["basicSettings", "advancedSettings", "devSettings"];

// all about the display page

function changeDisplaySubpage() {
    let selectionObject = document.getElementById(tagIdDisplaySelector);
    let currentSelection = selectionObject.value;
    log("change display subpage to '" + currentSelection + "'", 2);
    let pageFound = false;
    registeredDisplaySubpages.forEach(subpage => {
        if (currentSelection == subpage) {
            let subpageElement = document.getElementById(subpage);
            subpageElement.classList.remove("hidden");
            pageFound = true;
        } else {
            let subpageElement = document.getElementById(subpage);
            subpageElement.classList.add("hidden");
        }
    });
    if (!pageFound) {
        changeDisplaySubpageToDefault();
    }
}

function changeDisplaySubpageToDefault() {
    document.getElementById(registeredDisplaySubpages[0]).classList.remove("hidden");
    document.getElementById(tagIdDisplaySelector) = registeredDisplaySubpages[0];
}

// all about the settings page

function changeSettingsSubpage() {
    let selectionObject = document.getElementById(tagIdSettingsSelector);
    let currentSelection = selectionObject.value;
    log("change settings subpage to '" + currentSelection + "'", 2);
    let pageFound = false;
    registeredSettingsSubpages.forEach(subpage => {
        if (currentSelection == subpage) {
            let subpageElement = document.getElementById(subpage);
            subpageElement.classList.remove("hidden");
            pageFound = true;
        } else {
            let subpageElement = document.getElementById(subpage);
            subpageElement.classList.add("hidden");
        }
    });
    if (!pageFound) {
        changeSettingsSubpageToDefault();
    }
}

function changeSettingsSubpageToDefault() {
    document.getElementById(registeredSettingsSubpages[0]).classList.remove("hidden");
    document.getElementById(tagIdSettingsSelector) = registeredSettingsSubpages[0];
}