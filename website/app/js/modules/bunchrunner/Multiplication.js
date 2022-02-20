import * as appMath from '../math/math.js'
import Config from '../config/ConfigStateMachine.js'
import * as appTranslation from '../language/translation.js'
import Answer from './Answer.js'
import Task from './Task.js'

let lastTasks = []

export default class Multiplication extends Task {

    constructor(config = new Config(), index = 0) {
        super()

        this.type = '*'
        this.config = config
        let t = calculateTask(this.config)
        this.values[0] = t.factor0
        this.values[1] = t.factor1
        this.values[2] = t.factor2
        if (config.getValue("numberRangeBias")) {
            this.questionGUI = '<span class="question"><span class="value">' + formatNumberForGUI(this.values[0]) + '</span> <span class="operation">+</span> <span class="value">' + formatNumberForGUI(this.values[1]) + '</span> <span class="operation">⋅</span> <span class="value">' + formatNumberForGUI(this.values[2]) + '</span></span>'
            this.questionSUI = formatNumberForGUI(this.values[0]) + " " + appTranslation.translateForSoundOutput("plus") + " " + formatNumberForGUI(this.values[1]) + " " + appTranslation.translateForSoundOutput("multiplied by") + " " + formatNumberForGUI(this.values[2])
        } else {
            this.questionGUI = '<span class="question"><span class="value">' + formatNumberForGUI(this.values[1]) + '</span> <span class="operation">⋅</span> <span class="value">' + formatNumberForGUI(this.values[2]) + '</span></span>'
            this.questionSUI = formatNumberForGUI(this.values[1]) + " " + appTranslation.translateForSoundOutput("multiplied by") + " " + formatNumberForGUI(this.values[2])
        }
        this.answer = t.result
        this.answerGUI = '<span class="answer">' + formatNumberForGUI(t.result) + '</span>'
        this.answerSUI = formatNumberForSUI(t.result)
            // this.possiblePartialAnswers = calculateFractions(t.factor1, t.factor2)
    }

    isPartialSolution(input) {
        let c = input
        if (typeof input === 'string') {
            c = parseFloat(input.replace(",", "."))
        }
        if (input == this.answer) {
            return true
        }
        let analizationResult = analizeSolution(this, c)
        this.answers.push(new Answer(input, false, analizationResult))
        if (analizationResult == "") {
            return false
        } else {
            return analizationResult
        }
    }
}

export function formatNumberForGUI(n) {
    if (!n) {
        return ""
    }
    return n.toString().replace(".", ",");
}

export function formatNumberForSUI(n) {
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
    keys = appMath.sumRecursive(task, possibleSolution, 0, 0)
    for (let i = 0; i < keys.length; i++) {
        keys[i] = keys[i].replace(/[.]/g, ",");
    }
    return keys.join("+")
}

function calculateTask(config) {

    let f1Diff = config.getValue('numberRange1')[1] - config.getValue('numberRange1')[0]
    let f2Diff = config.getValue('numberRange2')[1] - config.getValue('numberRange2')[0]

    let f0 = false
    let f1 = 0
    let f2 = 0

    do {
        f1 = Math.round(Math.random() * f1Diff) + config.getValue('numberRange1')[0]
        f2 = Math.round(Math.random() * f2Diff) + config.getValue('numberRange2')[0]
    } while (taskWasPlayedBefore(f1, f2))

    if (config.getValue("numberRangeBias")) {
        let f0Diff = config.getValue("numberRangeBias")[1] - config.getValue("numberRangeBias")[0]
        do {
            f0 = Math.round(Math.random() * f0Diff) + config.getValue("numberRangeBias")[0]
        } while (f0 % f2 == 0 || f2 % f0 == 0)
    }

    let factor0Decimals = 0;
    let factor1Decimals = 0;
    let factor2Decimals = 0;

    if (config.getValue("isModeDecimalPlaces")) {
        for (let i = 0; i < f0.toString().length; i++) {
            if (0 < Math.round(Math.random())) {
                factor0Decimals++;
            }
        }
        f2 = appMath.divideBy10(f2, factor2Decimals);
        for (let i = 0; i < f1.toString().length; i++) {
            if (0 < Math.round(Math.random())) {
                factor1Decimals++;
            }
        }
        f1 = appMath.divideBy10(f1, factor1Decimals);
        for (let i = 0; i < f2.toString().length; i++) {
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

    let result = appMath.multiplyDecimal(f1, f2)
    if (f0) {
        result = roundNumber(f0 + result)
    }

    return {
        factor0: f0,
        factor0StringJoined: f0.toString().split(".").join(""),
        factor1: f1,
        factor1Decimals: factor1Decimals,
        factor1StringJoined: f1.toString().split(".").join(""),
        factor2: f2,
        factor2Decimals: factor2Decimals,
        factor2StringJoined: f2.toString().split(".").join(""),
        result: result
    }
}

function roundNumber(number, decimals = 12) {
    var newnumber = new Number(number + '').toFixed(parseInt(decimals));
    return parseFloat(newnumber);
}

function calculateFractions(factor1, factor2) {
    let fractionsTemp = appMath.findFractions(factor1, factor2);
    let fractions = new Map();
    for (let i = 0; i < fractionsTemp.length; i++) {
        fractions.set(fractionsTemp[i][0] + "⋅" + fractionsTemp[i][1], fractionsTemp[i][2])
    }

    return fractions
}

function taskWasPlayedBefore(f1, f2) {
    for (let i = 0; i < lastTasks.length; i++) {
        let oldTask = lastTasks[i];
        if (oldTask[0] == f1 && oldTask[1] == f2) {
            return true;
        }
        if (oldTask[0] == f2 && oldTask[1] == f1) {
            return true;
        }
    }
    return false
}