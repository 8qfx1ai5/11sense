import * as appSystem from '../main/system.js'

customElements.define('button-select', class extends HTMLElement {

    currentConfig

    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
    }

    /*
     * It is important, that the render function works only on the given data.
     * Do NOT trigger any events and also do NOT change the local storage!
     */
    render() {
        let configName = this.getAttribute('configName')
        let title = this.getAttribute('title')
        let label = this.getAttribute('label')
        let sublabel = this.getAttribute('sublabel')
        let isDisabled = this.hasAttribute('disabled')

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    
                }

                button {
                    background-color: var(--theme-color-7);
                    color: var(--theme-color-1);
                    font-family: inherit;
                    line-height: 0.9em;
                    border: none;
                    /* padding: 15px 32px; */
                    text-align: left;
                    text-decoration: none;
                    display: inline-block;
                    font-size: 1.4em;
                    cursor: pointer;
                    width: 100%;
                    margin-top: 5px;
                    vertical-align: top;
                    padding: 0.4em 1em 0.4em 1em;
                    position: relative;
                }

                button:focus,
                select:focus {
                    outline: none;
                }

                .disabled {
                    color: black;
                    text-decoration: line-through !important;
                    -webkit-tap-highlight-color: transparent;
                }

                #status {
                    color: var(--theme-color-8);
                    position: relative;
                    /* display: inline-block; */
                    float: right;
                    text-align: right;
                }

                select {
                    width: 4em;
                    height: 1em;
                    position: relative;
                    right: -0em;
                    background-color: var(--theme-color-7);
                    font-family: inherit;
                    font-size: inherit;
                    color: var(--theme-color-8);
                    display: inline-block;
                    padding: 0;
                    border: none;
                    text-align: right;
                    text-overflow: ellipsis;
                    direction: ltr;
                }

                #sublabel {
                    font-size: 0.6em !important;
                }

                #label {
                    display: inline-block;
                }

                /* hide select button arrow */
                select {
                    appearance: none;
                    /* for Firefox */
                    -moz-appearance: none;
                    /* for Chrome */
                    -webkit-appearance: none;
                }
                select::-ms-expand {
                    /* For IE10 */
                    display: none;
                }

            </style>
            <button title="${title}">
                <span id="label">${label}</span>
                <span id="status">
                    <select dir="rtl"></select>
                </span>
                <br />
                <span id="sublabel">(${sublabel})</span>
            </button>
        `

        let inputButton = this.shadowRoot.querySelector("button")
        let inputSelect = this.shadowRoot.querySelector("select")
        let labelSpan = this.shadowRoot.querySelector("#label")

        let selectedValue = this.currentConfig.getGlobalValue(configName)
        if (typeof selectedValue !== "string") {
            selectedValue = JSON.stringify(selectedValue)
        }
        let wasValueFound = false
        if (this.currentConfig.getGlobalOptions(configName).length == 0) {
            appSystem.log('error: invalid guiOptions config for "' + configName + '"', 1)
        }
        const options = this.currentConfig.getGlobalOptions(configName)
        for (let key in options) {
            if (typeof options[key] !== 'object') {
                appSystem.log('error: invalid option config "' + key + '" for "' + configName + '"', 1)
            }
            let optionElement = document.createElement("option");
            optionElement.value = key
            optionElement.text = this.currentConfig.getGuiLabel(key, options[key])
                // if (optionConfig.hasOwnProperty(2) && optionConfig[2] == "true") {
                //     option.setAttribute("translate", "yes")
                // } else {
                //     option.setAttribute("translate", "no")
                //     option.classList.add("notranslate")
                // }
            inputSelect.add(optionElement)
            if (!wasValueFound) {
                if (selectedValue == optionElement.value) {
                    inputSelect.value = selectedValue
                    wasValueFound = true
                } else if (this.currentConfig.getGlobalDefault(configName) === optionElement.value) {
                    inputSelect.value = optionElement.value
                }
            }
        }

        if (!inputSelect.value) {
            inputSelect.selectedIndex = 0
        }

        if (isDisabled) {
            inputButton.setAttribute("disabled", "disabled")
            inputButton.classList.add("disabled")
            inputSelect.setAttribute("disabled", "disabled")
            inputSelect.classList.add("disabled")
            labelSpan.classList.add("disabled")
        }

        inputButton.addEventListener('click', function(e) {
            e.preventDefault()
            if (inputSelect.options.length - 1 <= inputSelect.selectedIndex) {
                inputSelect.selectedIndex = 0
            } else {
                inputSelect.selectedIndex = inputSelect.selectedIndex + 1
            }
            inputSelect.dispatchEvent(new Event('change'))
        }.bind(this))

        inputSelect.addEventListener('click', function(e) {
            e.preventDefault()
            e.stopPropagation()
        }.bind(this))

        inputSelect.addEventListener('change', function(e) {
            if (this.currentConfig.getGlobalValue(configName) != inputSelect.value) {
                window.dispatchEvent(new CustomEvent('request-config-change', {
                    detail: {
                        [configName]: { value: inputSelect.value }
                    }
                }))
            }
        }.bind(this))
    }

    connectedCallback() {
        window.addEventListener("action-config-init", function(e) {
            // no error handling, fail fast, if config is missing
            this.currentConfig = e.detail.config
            this.render()
        }.bind(this))
        window.addEventListener("action-config-changed", function(e) {
            // no error handling, fail fast, if config is missing
            this.currentConfig = e.detail.config
            this.render()
        }.bind(this))
    }

    // static get observedAttributes() {
    //     return ['options']
    // }

    // attributeChangedCallback(attrName, oldVal, newVal) {
    //     this.render()
    // }
})