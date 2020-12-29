customElements.define('button-select', class extends HTMLElement {

    constructor() {
        super()

        this.attachShadow({ mode: 'open' })

        let configName = this.getAttribute('configName')
        let title = this.getAttribute('title')
        let label = this.getAttribute('label')
        let sublabel = this.getAttribute('sublabel')
        let options = JSON.parse(this.getAttribute('options'))
        let defaultOption = this.getAttribute('defaultOption')
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
                    text-align: center;
                    /* vertical-align: middle; */
                    /* border-radius: 25px; */
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

        options.forEach((optionConfig) => {
            let option = document.createElement("option");
            option.value = optionConfig[0]
            option.text = optionConfig[1]
            if (optionConfig.hasOwnProperty(2) && optionConfig[2] == "true") {
                option.setAttribute("translate", "yes")
            } else {
                option.setAttribute("translate", "no")
                option.classList.add("notranslate")
            }
            inputSelect.add(option)
        })

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
        });

        inputSelect.addEventListener('click', function(e) {
            e.preventDefault()
            e.stopPropagation()
        });

        inputSelect.addEventListener('change', (e) => {
            let oldValue = localStorage.getItem(configName)
            if (oldValue != inputSelect.value) {
                localStorage.setItem(configName, inputSelect.value)
                window.dispatchEvent(new CustomEvent('config_changed'))
            }
        })

        window.addEventListener("config_changed", function(e) {
            let newValue = localStorage.getItem(configName);
            if (!newValue || newValue == '') {
                localStorage.setItem(configName, defaultOption);
                inputSelect.value = defaultOption
            } else if (newValue != inputSelect.value) {
                inputSelect.value = newValue
            }
        })
    }
})