export default class Config {
    configID = false
    solutionGuideTime = 10000
    autoTaskTime = 5000
    language = "de"
    numberRanges = [2, 3]
    isDecimalPlacesMode = false
    bunchSize = 10

    constructor() {
        this.numberRanges[0] = parseInt(document.getElementById('f1').value, 10);
        this.numberRanges[1] = parseInt(document.getElementById('f2').value, 10);

        this.bunchSize = parseInt(document.getElementById('bunch-size-selector').value, 10);
    }
}