function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: "de,en",
        defaultLanguage: 'en',
    }, 'google_translate_element');
}

function getSelectedLanguage() {
    let languageSelector = document.getElementsByClassName("goog-te-combo");
    if (0 < languageSelector.length) {
        if (languageSelector[0].value == "de") {
            return "de-DE"
        }
    }
    return "en-US"
}

function setSelectedLanguage(l) {
    let languageSelector = document.getElementsByClassName("goog-te-combo");
    if (0 < languageSelector.length) {
        if (l == 'de' || l == "de-DE") {
            languageSelector[0].value = 'de';
        } else {
            languageSelector[0].value = 'en';
        }
        languageSelector[0].dispatchEvent(new Event('change'));
    }
}

function getBrowserLanguage() {
    return (navigator.language || navigator.userLanguage).split('-', 1)[0]
}