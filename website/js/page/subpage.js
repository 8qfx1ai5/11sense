let registeredDisplaySubpages = ["stats-history"];
let registeredSettingsSubpages = ["settings-basic", "settings-advanced"];

// all about the display page

function changeDisplaySubpageTo(targetpage = "stats-history") {
    log("change display subpage to '" + targetpage + "'", 1);
    document.getElementById(tagIdDisplaySelector).value = targetpage
    let hasPageFound = false
    registeredDisplaySubpages.forEach(subpage => {
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
        log("subpage not found '" + targetpage + "'", 2);
        changeDisplaySubpageTo()
    }
}

// all about the settings page

function changeSettingsSubpageTo(targetpage = "settings-basic") {
    log("change settings subpage to '" + targetpage + "'", 1);
    document.getElementById(tagIdSettingsSelector).value = targetpage
    let hasPageFound = false
    registeredSettingsSubpages.forEach(subpage => {
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
        log("subpage not found '" + targetpage + "'", 2);
        changeSettingsSubpageTo()
    }
}