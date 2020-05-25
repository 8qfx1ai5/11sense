(function() {
    decimalPlacesButtonLabelOn = document.getElementById('decimalPlaces-button-on');
    decimalPlacesButtonLabelOff = document.getElementById('decimalPlaces-button-off');
    decimalPlacesButton = document.getElementById('button-decimalPlaces');

    decimalPlacesButton.addEventListener('click', function(e) {
        toggleDecimalPlacesMode();
    });

    // set current decimal places mode
    isDecimalPlacesMode = localStorage.getItem('isDecimalPlacesModeActive') != "true";
    toggleDecimalPlacesMode();

    newTask();
})();