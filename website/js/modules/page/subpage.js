export let registeredDisplaySubpages = ["stats-history"];
export let registeredSettingsSubpages = ["settings-basic", "settings-advanced"];

// all about the display page

export function changeDisplaySubpageTo(targetpage = "stats-history") {
    appSystem.log("change display subpage to '" + targetpage + "'", 1);
    document.getElementById(appPage.tagIdDisplaySelector).value = targetpage
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
        appSystem.log("subpage not found '" + targetpage + "'", 2);
        changeDisplaySubpageTo()
    }
}

// all about the settings page

export function changeSettingsSubpageTo(targetpage = "settings-basic") {
    appSystem.log("change settings subpage to '" + targetpage + "'", 1);
    document.getElementById(appPage.tagIdSettingsSelector).value = targetpage
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
        appSystem.log("subpage not found '" + targetpage + "'", 2);
        changeSettingsSubpageTo()
    }
}