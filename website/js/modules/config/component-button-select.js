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
                    font-size: 1.5em;
                    cursor: pointer;
                    width: 100%;
                    margin-top: 5px;
                    /* height: 3em; */
                    vertical-align: top;
                    padding: 0.4em 1em 0.4em 1em;
                    position: relative;
                }

                button:focus,
                select:focus {
                    outline: none;
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
                    height: 2em;
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

        options.forEach((optionConfig) => {
            let option = document.createElement("option");
            option.value = optionConfig[0]
            option.text = optionConfig[1]
            if (optionConfig.hasOwnProperty(2) && optionConfig[2] == "true") {
                option.setAttribute("translate", "yes")
            } else {
                option.setAttribute("translate", "no")
            }
            inputSelect.add(option)
        })

        inputButton.addEventListener('click', function(e) {
            e.preventDefault()
            inputSelect.focus()
            inputSelect.click()
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