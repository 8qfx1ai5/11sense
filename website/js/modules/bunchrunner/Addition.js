import * as appMath from '../math/math.js'
import Config from './Config.js'
import * as appTranslation from '../language/translation.js'
import Answer from './Answer.js'
import Task from './Task.js'

let lastTasks = []

export default class Addition extends Task {

    constructor(config = new Config(), index = 0) {
        super()

        this.config = config
        let t = calculateTask(this.config, index)
        this.values[0] = t.part1
        this.values[1] = t.part2
        this.questionGUI = '<span class="question"><span class="value">' + formatNumberForGUI(this.values[0]) + '</span> <span class="operation">+</span> <span class="value">' + formatNumberForGUI(this.values[1]) + '</span></span>'
        this.questionSUI = formatNumberForGUI(this.values[0]) + " " + appTranslation.translateForSoundOutput("plus") + " " + formatNumberForGUI(this.values[1])
        this.answer = t.result
        this.answerGUI = '<span class="answer">' + formatNumberForGUI(t.result) + '</span>'
        this.answerSUI = formatNumberForSUI(t.result)
        this.possiblePartialAnswers = []
    }

    isPartialSolution(input) {
        return false
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
            return nS
        }
        let output = nSsplit[0] + ",";
        for (let i = 0; i < nSsplit[1].length; i++) {
            output += nSsplit[1][i] + " "
        }
        return output
    }

    return n.toString()
}

function analizeSolution(task, possibleSolution) {
    let keys = [];
    keys = appMath.sumRecursive(task, possibleSolution, 0, 0)
    for (let i = 0; i < keys.length; i++) {
        keys[i] = keys[i].replace(/[.]/g, ",")
    }
    return keys.join("+")
}

/**
 * @param {Config} config 
 */
function calculateTask(config, index) {
    let a = config.numberRanges[0]
    let b = config.numberRanges[1]

    a = Math.max(1, a)
    a = Math.min(10, a)
    b = Math.max(1, b)
    b = Math.min(10, b)

    let f1 = 0
    let f2 = 0

    if (config.isRacingMode) {
        if (index == 0) {
            do {
                f2 = Math.floor(Math.random() * (10 ** b));
            } while (f2 < 2 || f2.toString().length != b);
            do {
                do {
                    f1 = Math.floor(Math.random() * (10 ** a));
                } while (f1 < 2 || f1.toString().length != a);
            } while (f1 % f2 == 0 || f2 % f1 == 0);
        } else {
            f1 = lastTasks[0][0] + lastTasks[0][1]
            f2 = lastTasks[0][1]
        }
    } else {
        do {
            do {
                f1 = Math.floor(Math.random() * (10 ** a));
            } while (f1 < 2 || f1.toString().length != a);
            do {
                f2 = Math.floor(Math.random() * (10 ** b));
            } while (f2 < 2 || f2.toString().length != b);
        } while (taskWasPlayedBefore(f1, f2));
    }

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
        part1: f1,
        factor1Decimals: factor1Decimals,
        factor1StringJoined: f1.toString().split(".").join(""),
        part2: f2,
        factor2Decimals: factor2Decimals,
        factor2StringJoined: f2.toString().split(".").join(""),
        result: (f1 + f2)
    }
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