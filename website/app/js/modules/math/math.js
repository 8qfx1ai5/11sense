export function multiplyDecimal(x, y) {
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

export function addDecimal(x, y) {
    let xSplit = x.toString().split(".");
    let ySplit = y.toString().split(".");
    let maxDecimal = 0;
    if (xSplit.length > 1) {
        maxDecimal = Math.max(maxDecimal, xSplit[1].length);
    } else {
        xSplit[1] = "";
    }
    if (ySplit.length > 1) {
        maxDecimal = Math.max(maxDecimal, ySplit[1].length);
    } else {
        ySplit[1] = "";
    }
    xSplit[1] = xSplit[1].padEnd(maxDecimal, "0");
    ySplit[1] = ySplit[1].padEnd(maxDecimal, "0");
    let xs = parseInt(xSplit.join(""), 10)
    let ys = parseInt(ySplit.join(""), 10)
    let sum = xs + ys;

    return divideBy10(sum, maxDecimal);
}

export function divideBy10(x, i = 1) {
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

// function is unit tested with jest
export function findFractions(x, y) {
    let xs = x.toString();
    let s1d = getNumberOfDecimals(x);
    let s1s = xs.split(".").join("");
    let ys = y.toString();
    let s2d = getNumberOfDecimals(y);
    let s2s = ys.split(".").join("");
    let f = [];

    for (let i = 0; i < s1s.length; i++) {
        let currentTi = parseInt(s1s[i], 10);
        let currentTiShift = s1s.length - i - 1 - s1d;
        let ti = divideBy10(currentTi, currentTiShift * (-1));
        if (ti == 0) {
            continue
        }
        for (let j = 0; j < s2s.length; j++) {
            let currentTj = parseInt(s2s[j], 10);
            let currentTjShift = s2s.length - j - 1 - s2d;
            let tj = divideBy10(currentTj, currentTjShift * (-1));
            if (tj == 0) {
                continue
            }
            f.push([ti, tj, multiplyDecimal(ti, tj)]);
        }
    }
    return f;
}

export function getNumberOfDecimals(n) {
    let ns = n.toString();
    let decimals = ns.length - ns.indexOf(".") - 1;
    if (decimals == ns.length) {
        decimals = 0;
    }
    return decimals;
}

export function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

export function sumRecursive(task, s, i, c) {
    let keys = Array.from(task.possiblePartialAnswers.keys());
    for (let j = i; j < keys.length; j++) {
        let newCurrent = addDecimal(c, task.possiblePartialAnswers.get(keys[j]));
        if (newCurrent > s) {
            continue
        }
        if (newCurrent == s) {
            return [keys[j]]
        }
        let tempResult = sumRecursive(task, s, j + 1, newCurrent)
        if (0 < tempResult.length) {
            tempResult.push(keys[j])
            return tempResult
        }
    }
    return []
}

export function formatNumberForDisplay(n) {
    if (!n) {
        return ""
    }
    return n.toString().replace(".", ",")
}