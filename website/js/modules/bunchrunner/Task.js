import * as appMath from '../math/math.js'

let lastTasks = []

export default class Task {

    questionGUI = "3 ⋅ 6"
    answer = "18"
    possiblePartialAnswers = []
    answers = []
    wasPaused = false
    isSolved = false
    timedOut = false
    values = ["3", "6"]
    regex = "<0> ⋅ <1>"
    startTime = false
    endTime = false
    config = false

    constructor(config) {
        this.config = config
        let t = calculateTask(config.numberRanges[0], config.numberRanges[1], config.isDecimalPlacesMode)
        this.values[0] = t.factor1.toString()
        this.values[1] = t.factor2.toString()
        this.answer = t.result.toString()
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
        return (this.values[0] == 1 && this.values[1] == 1);
    }
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

function calculateTask(a, b, isDecimalPlacesMode = false) {
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

    if (isDecimalPlacesMode) {
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