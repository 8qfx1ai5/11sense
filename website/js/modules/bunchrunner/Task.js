import * as appMath from '../math/math.js'
import Config from './Config.js'
import * as appTranslation from '../language/translation.js'

let lastTasks = []

export default class Task {

    id
    questionGUI = '<span class="question"><span class="value">5,3</span> <span class="operation">⋅</span> <span class="value">6,8</span></span>'
    questionSUI = "5.3 multiplied by 6.8"
    answer = 36.04
    answerGUI = "36,04"
    answerSUI = "36.0 4"
    possiblePartialAnswers = []
    answers = []
    wasPaused = false
    wasSkipped = false
    isSolved = false
    wasTimedOut = false
    values = [5.3, 6.8]
    regex = "<0> ⋅ <1>"
    startTime = false
    endTime = false
    config = new Config()

    constructor(config = new Config()) {
        this.config = config
        let t = calculateTask(this.config)
        this.values[0] = t.factor1
        this.values[1] = t.factor2
        this.questionGUI = '<span class="question"><span class="value">' + formatNumberForGUI(this.values[0]) + '</span> <span class="operation">⋅</span> <span class="value">' + formatNumberForGUI(this.values[1]) + '</span></span>'
        this.questionSUI = formatNumberForGUI(this.values[0]) + " " + appTranslation.translateForSoundOutput("multiplied by") + " " + formatNumberForGUI(this.values[1])
        this.answer = t.result
        this.answerGUI = '<span class="answer">' + formatNumberForGUI(t.result) + '</span>'
        this.answerSUI = formatNumberForSUI(t.result)
        this.possiblePartialAnswers = calculateFractions(t.factor1, t.factor2)
    }

    isValidSolution(input) {
        if (input == this.answer) {
            this.answers.push({ input: input, time: performance.now(), isValid: true })
            return true
        }
        return false
    }

    isPartialSolution(input) {
        if (input == this.answer) {
            this.answers.push({ input: input, time: performance.now(), isValid: true })
            return true
        }
        let c = parseFloat(input.replace(",", "."))
        let analizationResult = analizeSolution(this, c)
        this.answers.push({ input: input, time: performance.now(), isValid: false, analizationResult: analizationResult })
        if (analizationResult == "") {
            return false
        } else {
            return analizationResult
        }
    }

    isBeginnerMode() {
        return (this.config.numberRanges[0] == 1 && this.config.numberRanges[1] == 1);
    }

    isNew() {
        return !this.isSolved && !this.wasPaused && !this.wasSkipped && !this.wasTimedOut
    }
}

function formatNumberForGUI(n) {
    if (!n) {
        return ""
    }
    return n.toString().replace(".", ",");
}

function formatNumberForSUI(n) {
    if (appTranslation.getSelectedLanguage() == "de-DE") {
        let nS = n.toString();
        let nSsplit = nS.split(".");
        if (nSsplit.length < 2) {
            return nS;
        }
        let output = nSsplit[0] + ",";
        for (let i = 0; i < nSsplit[1].length; i++) {
            output += nSsplit[1][i] + " "
        }
        return output;
    }

    return n.toString();
}

function analizeSolution(task, possibleSolution) {
    let keys = [];
    if (task.isBeginnerMode()) {
        keys = appMath.sumFlat(task, possibleSolution)
    } else {
        keys = appMath.sumRecursive(task, possibleSolution, 0, 0)
    }
    for (let i = 0; i < keys.length; i++) {
        keys[i] = keys[i].replace(/[.]/g, ",");
    }
    return keys.join("+")
}

function calculateTask(config) {
    let a = config.numberRanges[0]
    let b = config.numberRanges[1]

    a = Math.max(1, a)
    a = Math.min(10, a)
    b = Math.max(1, b)
    b = Math.min(10, b)

    let f1 = 0
    let f2 = 0
    do {
        do {
            f1 = Math.floor(Math.random() * (10 ** a));
        } while (f1 < 2 || f1.toString().length != a);
        do {
            f2 = Math.floor(Math.random() * (10 ** b));
        } while (f2 < 2 || f2.toString().length != b);
    } while (appMath.arrayIncludesCombination(lastTasks, f1, f2));

    let factor1Decimals = 0;
    let factor2Decimals = 0;

    if (config.isDecimalPlacesMode) {
        for (let i = 0; i < a; i++) {
            if (0 < Math.round(Math.random())) {
                factor1Decimals++;
            }
        }
        f1 = appMath.divideBy10(f1, factor1Decimals);
        for (let i = 0; i < b; i++) {
            if (0 < Math.round(Math.random())) {
                factor2Decimals++;
            }
        }
        f2 = appMath.divideBy10(f2, factor2Decimals);
    }

    for (let i = 19; i < lastTasks.length; i++) {
        lastTasks.pop();
    }

    lastTasks.unshift([f1, f2]);

    return {
        factor1: f1,
        factor1Decimals: factor1Decimals,
        factor1StringJoined: f1.toString().split(".").join(""),
        factor2: f2,
        factor2Decimals: factor2Decimals,
        factor2StringJoined: f2.toString().split(".").join(""),
        result: appMath.multiplyDecimal(f1, f2)
    }
}

function calculateFractions(factor1, factor2) {
    let fractionsTemp = appMath.findFractions(factor1, factor2);
    let fractions = new Map();
    for (let i = 0; i < fractionsTemp.length; i++) {
        fractions.set(fractionsTemp[i][0] + "⋅" + fractionsTemp[i][1], fractionsTemp[i][2])
    }

    return fractions
}