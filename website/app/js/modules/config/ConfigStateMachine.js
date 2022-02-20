import * as appSystem from '../main/system.js'

export let events = [
    'action-config-init',
    'action-config-changed',
]

const browserIndependentSpeechSynthesis = window.webkitSpeechSynthesis || window.mozSpeechSynthesis || window.msSpeechSynthesis || window.oSpeechSynthesis || window.speechSynthesis

let globalParamConfig = {
    "solutionGuideTime": {
        "type": "integer",
        "options": {
            "0": { "gui": "off" },
            "5000": { "gui": "5" },
            "6000": { "gui": "6" },
            "7000": { "gui": "7" },
            "8000": { "gui": "8" },
            "9000": { "gui": "9" },
            "10000": { "gui": "10" },
            "15000": { "gui": "15" },
            "20000": { "gui": "20" },
            "25000": { "gui": "25" },
            "30000": { "gui": "30" },
            "60000": { "gui": "60" },
            "120000": { "gui": "120" },
            "180000": { "gui": "180" },
        },
        "min": -1,
        "max": 1000000,
        "description": "milliseconds to solve the task",
        "default": 15,
        "required": false,
        "guiOptions": [],
        "value": null,
        "saveLocal": true,
    },
    "autoTaskTime": {
        "type": "integer",
        "options": {
            "0": { "gui": "0" },
            "1000": { "gui": "1" },
            "2000": { "gui": "2" },
            "5000": { "gui": "5" },
            "10000": { "gui": "10" },
            "15000": { "gui": "15" },
            "20000": { "gui": "20" },
            "25000": { "gui": "25" },
            "30000": { "gui": "30" },
            "9999999": { "gui": "∞" }
        },
        "min": -1,
        "max": 9999999,
        "description": "milliseconds between two tasks, after the last was finished",
        "default": 5,
        "required": false,
        "guiOptions": [],
        "value": null,
        "saveLocal": true,
    },
    "numberRangeBias": {
        "type": "integer pair",
        "options": {
            "[0,0]": { "gui": "off" },
            "[2,10]": { "gui": "2-10" },
            "[11,20]": { "gui": "11-20" },
            "[21,30]": { "gui": "21-30" },
            "[31,40]": { "gui": "31-40" },
            "[41,50]": { "gui": "41-50" },
            "[11,50]": { "gui": "11-50" },
            "[51,99]": { "gui": "51-99" },
            "[11,99]": { "gui": "11-99" },
            "[99,299]": { "gui": "99-299" },
            "[99,999]": { "gui": "99-999" },
        },
        "min": 2,
        "max": 100000,
        "description": "the number 0 is used to add a bias to tasks",
        "default": [0, 0],
        "required": false,
        "value": null,
        "saveLocal": true,
    },
    "numberRange1": {
        "type": "integer pair",
        "options": {
            "[2,10]": { "gui": "2-10" },
            "[11,20]": { "gui": "11-20" },
            "[21,30]": { "gui": "21-30" },
            "[31,40]": { "gui": "31-40" },
            "[41,50]": { "gui": "41-50" },
            "[11,50]": { "gui": "11-50" },
            "[51,99]": { "gui": "51-99" },
            "[11,99]": { "gui": "11-99" },
            "[99,299]": { "gui": "99-299" },
            "[99,999]": { "gui": "99-999" },
        },
        "min": 2,
        "max": 100000,
        "description": "the first main number",
        "default": [2, 10],
        "required": true,
        "value": null,
        "saveLocal": true,
    },
    "numberRange2": {
        "type": "integer pair",
        "options": {
            "[2,10]": { "gui": "2-10" },
            "[11,20]": { "gui": "11-20" },
            "[21,30]": { "gui": "21-30" },
            "[31,40]": { "gui": "31-40" },
            "[41,50]": { "gui": "41-50" },
            "[11,50]": { "gui": "11-50" },
            "[51,99]": { "gui": "51-99" },
            "[11,99]": { "gui": "11-99" },
            "[99,299]": { "gui": "99-299" },
            "[99,999]": { "gui": "99-999" },
        },
        "min": 2,
        "max": 100000,
        "description": "the second main number",
        "default": [2, 10],
        "required": false,
        "value": null,
        "saveLocal": true,
    },
    "isModeDecimalPlaces": {
        "type": "boolean",
        "description": "decide if you want numbers with decimal places or not",
        "default": false,
        "required": false,
        "guiOptions": [],
        "value": null,
        "saveLocal": true,
    },
    "isModeRacing": {
        "type": "boolean",
        "description": "decide if you want numbers with decimal places or not",
        "default": false,
        "required": false,
        "guiOptions": [],
        "value": null,
        "saveLocal": true,
    },
    "bunchSize": {
        "type": "integer",
        "options": {
            "1": {},
            "5": {},
            "10": {},
            "15": {},
            "20": {},
            "25": {},
            "30": {},
            "40": {},
            "50": {},
            "60": {},
            "80": {},
            "100": {}
        },
        "min": 2,
        "max": 100,
        "description": "how many tasks should be contained in a run",
        "default": 10,
        "required": true,
        "value": null,
        "saveLocal": true
    },
    "selectedOperator": {
        "type": "string",
        "options": {
            "+": {},
            "*": {}
        },
        "min": 1,
        "max": 10,
        "description": "what task do we want to process",
        "default": "+",
        "required": true,
        "value": null,
        "saveLocal": true
    },
    "isModeHideTask": {
        "type": "boolean",
        "description": "decide if following tasks schould be hidden or not",
        "default": false,
        "required": false,
        "guiOptions": [],
        "value": null,
        "saveLocal": true
    },
    "selectedLanguage": {
        "type": "enum",
        "options": {
            "en-US": {},
            "de-DE": {}
        },
        "description": "what kind of language should we use in GUI and SUI",
        "default": "en-US",
        "required": true,
        "value": null,
        "saveLocal": true
    },
    "logLevel": {
        "type": "integer",
        "options": {
            "1": { "gui": "verbose" },
            "2": { "gui": "default" },
            "3": { "gui": "error" },
            "4": { "gui": "off" }
        },
        "min": 1,
        "max": 4,
        "description": "this log level from 4=off to 1=verbose",
        "default": 3,
        "required": true,
        "value": null,
        "saveLocal": true
    },
    "designTheme": {
        "type": "enum",
        "options": {
            "dark": {},
            "bright": {}
        },
        "description": "how should the GUI look like",
        "default": "dark",
        "required": true,
        "value": null,
        "saveLocal": true
    },
    "isModeUserTalks": {
        "type": "boolean",
        "description": "the web app as active microphones",
        "default": false,
        "required": false,
        "guiOptions": [],
        "value": null,
        "saveLocal": true
    },
    "isModeUserListens": {
        "type": "boolean",
        "description": "the web app speeks over the sound system",
        "default": false,
        "required": false,
        "value": null,
        "saveLocal": true
    },
    "speechRecognitionType": {
        "type": "enum",
        "options": {
            "endless": { "gui": "∞" },
            "noise": { "gui": "NOISE" }
        },
        "description": "how the speech recognition is implemented",
        "default": "endless",
        "required": false,
        "value": null,
        "saveLocal": true
    },
    "soundOutputVoiceType": {
        "type": "integer",
        "options": {
            "0": { "gui": "default" }
        },
        "min": 1,
        "max": 100,
        "description": "select a voice preinstalled in the browser, depending on the selected language",
        "default": 0,
        "required": true,
        "value": null,
        "saveLocal": true
    },
    "selectedExercise": {
        "type": "enum",
        "options": {
            "custom": {},
            "add_race_1": { "gui": "A1" },
            "add_race_2": { "gui": "A2" },
            "add_race_3": { "gui": "A3" },
            "add_race_4": { "gui": "A4" },
            "add_race_5": { "gui": "A5" },
            "add_race_10": { "gui": "B1" },
            "add_race_11": { "gui": "B2" },
            "add_1": { "gui": "L1 +" },
            "mult_1": { "gui": "L1 *" },
        },
        "description": "the preferred exercise as preconfigurated set",
        "default": "custom",
        "required": true,
        "value": null,
        "saveLocal": true
    },
    "levelTitle": {
        "type": "string",
        "options": {},
        "min": 1,
        "max": 100,
        "description": "the title of a preconfigured level",
        "default": '',
        "required": false,
        "value": null,
        "saveLocal": false
    },
    "levelDescription": {
        "type": "string",
        "options": {},
        "min": 1,
        "max": 100,
        "description": "the description of a preconfigured level",
        "default": '',
        "required": false,
        "value": null,
        "saveLocal": false
    },
    "bunchSuccessMessage": {
        "type": "string",
        "options": {},
        "min": 1,
        "max": 100,
        "description": "if the buch was completet in time, the user will get this message",
        "default": '',
        "required": false,
        "value": null,
        "saveLocal": false
    },
    "bunchFailureMessage": {
        "type": "string",
        "options": {},
        "min": 1,
        "max": 100,
        "description": "if the buch was not completet in time, the user will get this message",
        "default": '',
        "required": false,
        "value": null,
        "saveLocal": false
    },
}

export let preconfiguredLevels = {

    "add_race_1": {
        "solutionGuideTime": false,
        "autoTaskTime": 0,
        "numberRangeBias": false,
        "numberRange1": [2, 10],
        "numberRange2": [2, 10],
        "isModeDecimalPlaces": false,
        "isModeRacing": true,
        "bunchSize": 10,
        "selectedOperator": '+',
        "isModeHideTask": false,
        "levelTitle": "Simple Counting",
        "levelDescription": "This exercise is an introduction into the system. You will add a number again and again.\nLike: 4+4+4+4+4",
        "successTime": 100000,
        "bunchSuccessMessage": "Well done. If you feel comfortable, you should level up.",
        "bunchFailureMessage": "There is a lot of potential. Continue training and you will grow and rise.",
    },
    "add_race_2": {
        "solutionGuideTime": false,
        "autoTaskTime": 0,
        "numberRangeBias": false,
        "numberRange1": [2, 10],
        "numberRange2": [2, 10],
        "isModeDecimalPlaces": false,
        "isModeRacing": true,
        "bunchSize": 10,
        "selectedOperator": '+',
        "isModeHideTask": true,
        "levelTitle": "Hidden Counting",
        "levelDescription": "This exercise is an introduction into the hidden mode. You will do the same like in the previous exercise\n(4+4+4+4+4),\nbut the tasks are hidden, so just enter the solution and reuse them in the next task.",
        "successTime": 100000,
        "bunchSuccessMessage": "Well done. If you feel comfortable, you should level up.",
        "bunchFailureMessage": "There is a lot of potential. Continue training and you will grow and rise.",
    },
    "add_race_3": {
        "solutionGuideTime": false,
        "autoTaskTime": 0,
        "numberRangeBias": [2, 10],
        "numberRange1": [2, 10],
        "numberRange2": [2, 10],
        "isModeDecimalPlaces": false,
        "isModeRacing": true,
        "bunchSize": 10,
        "selectedOperator": '+',
        "isModeHideTask": true,
        "levelTitle": "Salted Counting",
        "levelDescription": "You will do the same like in the previous exercise. But now we will add some random number in front of the row.\nLike: 7+4+4+4+4+4",
        "successTime": 100000,
        "bunchSuccessMessage": "Well done. If you feel comfortable, you should level up.",
        "bunchFailureMessage": "There is a lot of potential. Continue training and you will grow and rise.",
    },
    "add_race_4": {
        "solutionGuideTime": false,
        "autoTaskTime": 0,
        "numberRangeBias": [2, 10],
        "numberRange1": [11, 20],
        "numberRange2": [11, 20],
        "isModeDecimalPlaces": false,
        "isModeRacing": true,
        "bunchSize": 10,
        "selectedOperator": '+',
        "isModeHideTask": true,
        "levelTitle": "Level A4",
        "levelDescription": "Lets increase the number range to 11-20.\n(Like: 3+14+14+14+14)",
        "successTime": 100000,
        "bunchSuccessMessage": "Well done. If you feel comfortable, you should level up.",
        "bunchFailureMessage": "There is a lot of potential. Continue training and you will grow and rise.",
    },
    "add_race_5": {
        "solutionGuideTime": false,
        "autoTaskTime": 0,
        "numberRangeBias": [99, 999],
        "numberRange1": [11, 20],
        "numberRange2": [11, 20],
        "isModeDecimalPlaces": false,
        "isModeRacing": true,
        "bunchSize": 10,
        "selectedOperator": '+',
        "isModeHideTask": true,
        "levelTitle": "Level A5",
        "levelDescription": "Lets increase the base number.\nLike: 534+11+11+11+11+11",
        "successTime": 100000,
        "bunchSuccessMessage": "Well done. If you feel comfortable, you should level up.",
        "bunchFailureMessage": "There is a lot of potential. Continue training and you will grow and rise.",
    },
    "add_race_10": {
        "solutionGuideTime": false,
        "autoTaskTime": 0,
        "numberRangeBias": [11, 20],
        "numberRange1": [2, 10],
        "numberRange2": [2, 10],
        "isModeDecimalPlaces": false,
        "isModeRacing": false,
        "bunchSize": 5,
        "selectedOperator": '*',
        "isModeHideTask": false,
        "levelTitle": "Level B1",
        "levelDescription": "On the B Level the focus lies on the speed up. There for we forget about the intermediate results.\nYou get: 13+5*7.\nYou calculate: 13+7+7+7+7+7.\nYou enter only the final result.",
        "successTime": 100000,
        "bunchSuccessMessage": "Well done. If you feel comfortable, you should level up.",
        "bunchFailureMessage": "There is a lot of potential. Continue training and you will grow and rise.",
    },
    "add_race_11": {
        "solutionGuideTime": false,
        "autoTaskTime": 0,
        "numberRangeBias": [11, 20],
        "numberRange1": [2, 10],
        "numberRange2": [11, 20],
        "isModeDecimalPlaces": false,
        "isModeRacing": false,
        "bunchSize": 5,
        "selectedOperator": '*',
        "isModeHideTask": false,
        "levelTitle": "Level B2",
        "levelDescription": "Lets increase the number range to 11-20.\n(Like: 16+6*14)",
        "successTime": 100000,
        "bunchSuccessMessage": "Well done. If you feel comfortable, you should level up.",
        "bunchFailureMessage": "There is a lot of potential. Continue training and you will grow and rise.",
    },
    "add_1": {
        "solutionGuideTime": 20000,
        "autoTaskTime": 3000,
        "numberRangeBias": false,
        "numberRange1": [2, 10],
        "numberRange2": [2, 10],
        "isModeDecimalPlaces": false,
        "isModeRacing": false,
        "bunchSize": 10,
        "selectedOperator": '+',
        "isModeHideTask": false,
        "levelTitle": "+ Level 1",
        "levelDescription": "This is a traditional addition exercise\nwith values between 2 and 10.",
        "successTime": 100000,
        "bunchSuccessMessage": "Well done. If you feel comfortable, you should level up.",
        "bunchFailureMessage": "There is a lot of potential. Continue training and you will grow and rise.",
    },
    "mult_1": {
        "solutionGuideTime": 20000,
        "autoTaskTime": 5000,
        "numberRangeBias": false,
        "numberRange1": [2, 10],
        "numberRange2": [2, 10],
        "isModeDecimalPlaces": false,
        "isModeRacing": false,
        "bunchSize": 10,
        "selectedOperator": '*',
        "isModeHideTask": false,
        "levelTitle": "* Level 1",
        "levelDescription": "This is a traditional multiplication exercise\nwith values between 2 and 10.",
        "successTime": 100000,
        "bunchSuccessMessage": "Well done. If you feel comfortable, you should level up.",
        "bunchFailureMessage": "There is a lot of potential. Continue training and you will grow and rise."
    },
    "custom": {
        "levelTitle": "Custom Mode",
        "levelDescription": "We use your manual configuration.\n\nYou can change the settings or select a preconfigured exercise in the nav on the right side.",
        "bunchSuccessMessage": "Well done.",
        "bunchFailureMessage": "There is a lot of potential. Continue training and you will grow and rise."
    }
}

export default class Config {
    globalParamConfig = globalParamConfig
    paramConfig = globalParamConfig

    getGlobalValue(name) {
        if (!this.globalParamConfig.hasOwnProperty(name)) {
            appSystem.log('global config "' + name + '" not found', 1)
        }
        return this.globalParamConfig[name]["value"]
    }

    getValue(name) {
        return this.paramConfig[name]["value"]
    }

    setGlobalValue(name, value) {
        if (!this.globalParamConfig.hasOwnProperty(name)) {
            this.globalParamConfig[name] = {}
        }
        this.globalParamConfig[name]["value"] = value
    }

    setValue(name, value) {
        if (!this.paramConfig.hasOwnProperty(name)) {
            this.paramConfig[name] = {}
        }
        this.paramConfig[name]["value"] = value
    }

    getGlobalOptions(name) {
        if (!this.globalParamConfig.hasOwnProperty(name) || !this.globalParamConfig[name].hasOwnProperty("options")) {
            appSystem.log('global config options "' + name + '" not found', 1)
        }

        return this.globalParamConfig[name]["options"]
    }

    getGuiLabel(optionKey, optionObject) {
        if (optionObject.hasOwnProperty('gui')) {
            return optionObject['gui']
        }
        return optionKey
    }

    getGlobalDefault(name) {
        return this.globalParamConfig[name]["default"]
    }

    constructor() {

        // load preconfigured level if selected
        let level = globalParamConfig['selectedExercise']['value']
        if (!preconfiguredLevels.hasOwnProperty(level)) {
            level = 'custom'
        }
        for (const [key, value] of Object.entries(preconfiguredLevels[level])) {
            this.setValue(key, value)
        }

        // TODO: replace configId with "selectedExercise"
        this.configId = level
    }
}

export let currentConfig

/*
 @var value can be the original or string repräsentation
 */
function checkParamValidity(name, value) {
    if (!globalParamConfig.hasOwnProperty(name)) {
        appSystem.log('error: no param config found for \"' + name + '"', 1)
        return null
    }
    if (value === null) {
        return null
    }
    const paramConfig = globalParamConfig[name]
    switch (paramConfig['type']) {
        case "integer":
            if (typeof value === 'string' && /^(\-|\+)?([0-9]+)$/.test(value)) {
                value = JSON.parse(value)
            }
            if (!Number.isInteger(value)) {
                return null
            }
            if (value < paramConfig["min"] || paramConfig["max"] < value) {
                return null
            }
            return parseInt(value)
        case "integer pair":
            if (typeof value === 'string') {
                value = JSON.parse(value)
            }
            if (!(typeof value === 'object')) {
                return null
            }
            if (!value.length == 2) {
                return null
            }
            if (!Number.isInteger(value[0]) || !Number.isInteger(value[1])) {
                return null
            }
            return value
        case "string":
            if (!(typeof value === 'string')) {
                return null
            }
            if (value.length < paramConfig["min"] || paramConfig["max"] < value.length) {
                return null
            }
            return value
        case "boolean":
            if (!(typeof value === 'boolean') && !["true", "false"].includes(value)) {
                return null
            }
            return value == "true"
        case "enum":
            if (!paramConfig['options'].hasOwnProperty(value)) {
                return null
            }
            return value
        default:
            appSystem.log('error: param type unknwn for "' + name + '"', 1)
            return null
    }
}

function loadConfigParamFromLocalStorage(name) {
    return checkParamValidity(name, localStorage.getItem(name))
}

function saveConfigParamInLocalStorage(name, value) {
    switch (globalParamConfig[name]['type']) {
        case 'integer':
            if (typeof value == 'string') {
                value = parseInt(value)
            }
        case 'integer pair':
            if (typeof value !== 'string') {
                value = JSON.stringify(value)
            }
    }
    localStorage.setItem(name, value)
}

function loadAndInitializeConfig() {
    for (const key in globalParamConfig) {
        let currentValue = loadConfigParamFromLocalStorage(key)
        if (currentValue === null) {
            if (key == "selectedLanguage") {
                currentValue = (navigator.language || navigator.userLanguage)
            } else {
                currentValue = globalParamConfig[key]['default']
            }
            saveConfigParamInLocalStorage(key, currentValue)
        }
        globalParamConfig[key]["value"] = currentValue
    }
}

function updateVoiceTypeOptions() {
    // based on the selected language
    let newOptions = {}
    const voices = browserIndependentSpeechSynthesis.getVoices()

    if (voices.length == 0) {
        return false
    }

    const getSelectedLanguage = globalParamConfig['selectedLanguage']['value']
    for (let i = 0; i < voices.length; i++) {
        if (voices[i].lang == getSelectedLanguage) {
            newOptions[i] = { gui: voices[i].name }
        }
    }
    if (JSON.stringify(newOptions) === JSON.stringify(globalParamConfig['soundOutputVoiceType']['options'])) {
        return false
    }
    globalParamConfig['soundOutputVoiceType']['options'] = newOptions

    let currentValue = globalParamConfig['soundOutputVoiceType']['value']
    if (!newOptions.hasOwnProperty(currentValue)) {
        // selected index can not applied to the current language
        currentValue = Object.keys(newOptions).find(Boolean)
        globalParamConfig['soundOutputVoiceType']['value'] = currentValue
        saveConfigParamInLocalStorage('soundOutputVoiceType', currentValue)
    }
    return true
}

export function init() {

    window.addEventListener('action-config-init', function(e) {})

    window.addEventListener('action-config-changed', function(e) {
        window.dispatchEvent(new CustomEvent('bunch-request-new'))
    })

    loadAndInitializeConfig()
    updateVoiceTypeOptions()
    currentConfig = new Config()
    window.dispatchEvent(new CustomEvent('action-config-init', { detail: { config: currentConfig } }))

    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = function() {
            if (updateVoiceTypeOptions()) {
                currentConfig = new Config()
                window.dispatchEvent(new CustomEvent('action-config-changed', { detail: { config: currentConfig } }))
            }
        }
    }

    setTimeout(function() {
        if (updateVoiceTypeOptions()) {
            currentConfig = new Config()
            window.dispatchEvent(new CustomEvent('action-config-changed', { detail: { config: currentConfig } }))
        }
    }, 3000)

    window.addEventListener('request-config-change', function(e) {
        // TODO: maybe some checks required
        for (const configKey in e.detail) {
            for (const property in e.detail[configKey]) {
                globalParamConfig[configKey][property] = e.detail[configKey][property]
                if (property == "value") {
                    saveConfigParamInLocalStorage(configKey, e.detail[configKey]["value"])
                }
            }
            if (configKey == "selectedLanguage") {
                updateVoiceTypeOptions()
            }
        }
        currentConfig = new Config()
        for (const configKey in e.detail) {
            window.dispatchEvent(new CustomEvent('action-config-changed_' + configKey, { detail: { config: currentConfig } }))
        }
        window.dispatchEvent(new CustomEvent('action-config-changed', { detail: { config: currentConfig } }))
    }.bind(this))
}