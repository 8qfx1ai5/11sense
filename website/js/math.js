let decimalPlacesButtonLabelOn;
let decimalPlacesButtonLabelOff;
let isDecimalPlacesMode = false;

let factor1 = 0;
let factor1StringJoined = "";
let factor1Decimals = 0;
let factor2 = 0;
let factor2StringJoined = "";
let factor2Decimals = 0;
let result = 0;
let resultStringJoined = "";
let resultDecimals = 0;
let fractions = new Map();
let lastTasks = [];

function toggleDecimalPlacesMode() {
    if (isDecimalPlacesMode) {
        deactivateDecimalPlacesMode();
    } else {
        activateDecimalPlacesMode();
    }
}

function activateDecimalPlacesMode() {
    isDecimalPlacesMode = true;
    localStorage.setItem('isDecimalPlacesModeActive', true);
    decimalPlacesButtonLabelOn.classList.remove("hidden");
    decimalPlacesButtonLabelOff.classList.add("hidden");
}

function deactivateDecimalPlacesMode() {
    isDecimalPlacesMode = false;
    localStorage.setItem('isDecimalPlacesModeActive', false);
    decimalPlacesButtonLabelOn.classList.add("hidden");
    decimalPlacesButtonLabelOff.classList.remove("hidden");
}

function multiplyDecimal(x, y) {
    let xSplit = x.toString().split(".");
    let ySplit = y.toString().split(".");
    let xs = parseInt(xSplit.join(""), 10)
    let ys = parseInt(ySplit.join(""), 10)
    let p = xs * ys;
    let decimals = 0;
    if (xSplit.length > 1) {
        decimals += xSplit[1].length;
    }
    if (ySplit.length > 1) {
        decimals += ySplit[1].length;
    }
    return divideBy10(p, decimals);
}

function divideBy10(x, i = 1) {
    let xs = x.toString();
    let result = "";
    if (i < 0) {
        result = xs;
        for (let ii = 0; ii > i; ii--) {
            result += "0";
        }
    } else {
        xs = xs.padStart(i, '0');
        result = [xs.slice(0, xs.length - i), ".", xs.slice(xs.length - i)].join('');
    }
    let output = parseFloat(result);
    return output;
}

function calculateFractions() {
    fractions = findFractions(factor1StringJoined, factor1Decimals, factor2StringJoined, factor2Decimals);
    updateSolution()
}

function findFractions(s1, s1d, s2, s2d) {
    let f = new Map();

    for (let i = 0; i < s1.length; i++) {
        let currentTi = parseInt(s1[i], 10);
        let currentTiShift = s1.length - i - 1 - s1d;
        let ti = divideBy10(currentTi, currentTiShift * (-1));
        if (ti == 0) {
            continue
        }
        for (let j = 0; j < s2.length; j++) {
            let currentTj = parseInt(s2[j], 10);
            let currentTjShift = s2.length - j - 1 - s2d;
            let tj = divideBy10(currentTj, currentTjShift * (-1));
            if (tj == 0) {
                continue
            }
            f.set(ti + "⋅" + tj, multiplyDecimal(ti, tj))
        }
    }
    return f;
}

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function sumRecursive(i, c, s) {
    let keys = Array.from(fractions.keys());
    for (let j = i; j < keys.length; j++) {
        let newCurrent = c + fractions.get(keys[j]);
        if (newCurrent > s) {
            continue
        }
        if (newCurrent == s) {
            return [keys[j]]
        }
        let tempResult = sumRecursive(j + 1, newCurrent, s)
        if (0 < tempResult.length) {
            tempResult.push(keys[j])
            return tempResult
        }
    }
    return []
}

function sumFlat(s) {
    let keys = Array();
    let tempSum = 0;
    for (let i = 1; i <= factor1; i++) {
        keys.push(factor2)
        tempSum += factor2;
        if (tempSum == s) {
            if (i == 1) {
                return ["1⋅" + factor2.toString()]
            }
            return [i.toString() + "⋅" + factor2.toString()]
        }
    }
    keys = Array();
    tempSum = 0;
    for (let j = 1; j <= factor2; j++) {
        keys.push(factor1)
        tempSum += factor1;
        if (tempSum == s) {
            if (j == 1) {
                return ["1⋅" + factor1.toString()]
            }
            return [j.toString() + "⋅" + factor1.toString()]
        }
    }
    return []
}

function newTask(setFocus = true) {
    if (setFocus) {
        hideNav();
        currentSolution.focus();
        window.scrollTo(0, 0);
        if (wasSolved && !isVoiceModeActive) {
            enterFullscreen();
        }
    }
    let f1 = parseInt(f1input.value, 10);
    if (isNaN(f1)) {
        f1 = parseInt(f1input.placeholder, 10);
    }
    f1 = f1 % 10;
    let f2 = parseInt(f2input.value, 10);
    if (isNaN(f2)) {
        f2 = parseInt(f2input.placeholder, 10);
    }
    f2 = f2 % 10;
    let f1x = Math.max(1, f1)
    let f2x = Math.max(1, f2)
    if (f1 != f1x) {
        f1input.value = f1x
    }
    if (f2 != f2x) {
        f2input.value = f2x
    }
    localStorage.setItem('f1', f1x)
    localStorage.setItem('f2', f2x)
    f1input.value = f1x;
    f2input.value = f2x;

    isBeginnerModeActive = (f1x == 1 && f2x == 1);
    wasSolved = false;
    clearInterval(autoTaskTimer);

    calculateTask(f1x, f2x)
    updateView()
    resetInput()
    calculateFractions()
    remuteVoice();
    //startDictation();
}

function arrayIncludesCombination(a, f1, f2) {
    for (let i = 0; i < a.length; i++) {
        let oldTask = a[i];
        if (oldTask[0] == f1 && oldTask[1] == f2) {
            return true;
        }
        if (oldTask[0] == f2 && oldTask[1] == f1) {
            return true;
        }
    }
    return false
}


function calculateTask(a, b) {
    a = Math.max(1, a)
    a = Math.min(10, a)
    b = Math.max(1, b)
    b = Math.min(10, b)
    do {
        do {
            factor1 = Math.floor(Math.random() * (10 ** a));
        } while (factor1 < 2 || factor1.toString().length != a);
        do {
            factor2 = Math.floor(Math.random() * (10 ** b));
        } while (factor2 < 2 || factor2.toString().length != b);
    } while (arrayIncludesCombination(lastTasks, factor1, factor2));

    factor1Decimals = 0;
    factor2Decimals = 0;

    if (isDecimalPlacesMode) {
        for (let i = 0; i < a; i++) {
            if (0 < Math.round(Math.random())) {
                factor1Decimals++;
            }
        }
        factor1 = divideBy10(factor1, factor1Decimals);
        for (let i = 0; i < b; i++) {
            if (0 < Math.round(Math.random())) {
                factor2Decimals++;
            }
        }
        factor2 = divideBy10(factor2, factor2Decimals);
    }

    factor2StringJoined = factor2.toString().split(".").join("");
    factor1StringJoined = factor1.toString().split(".").join("");

    for (let i = 19; i < lastTasks.length; i++) {
        lastTasks.pop();
    }

    lastTasks.unshift([factor1, factor2]);

    result = multiplyDecimal(factor1, factor2)
    startTime = performance.now();
    endTime = null;
}