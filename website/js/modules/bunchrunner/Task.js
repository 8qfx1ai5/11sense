import Config from '../config/Config.js'
import * as appTranslation from '../language/translation.js'
import Answer from './Answer.js'

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
    date = new Date()
    type = ''

    isValidSolution(input, doSave = false) {
        if (input == this.answer) {
            if (doSave) {
                this.answers.push(new Answer(input, true))
            }
            return true
        }
        return false
    }

    isPartialSolution(input) {
        return false
    }

    isNew() {
        return !this.isSolved && !this.wasPaused && !this.wasSkipped && !this.wasTimedOut
    }

    isRunning() {
        return this.startTime && this.isNew()
    }

    getLastAnswer() {
        if (this.answers.length === 0) {
            return false
        }
        return this.answers[this.answers.length - 1]
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