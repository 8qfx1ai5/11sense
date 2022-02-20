customElements.define('button-toggle', class extends HTMLElement {

    currentConfig

    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
    }

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

                button:focus {
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
                    float: right;
                    text-align: right;
                }

                #sublabel {
                    font-size: 0.6em !important;
                }

                #label {
                    display: inline-block;
                }

                .hidden {
                    display: none;
                }

            </style>
            <button title="${title}">
                <span id="label">${label}</span>
                <span id="status">
                    <span id="on" class="hidden" >on</span>
                    <span id="off" >off</span>
                </span>
                <br />
                <span id="sublabel">(${sublabel})</span>
            </button>
        `

        let inputButton = this.shadowRoot.querySelector('button')
        let statusOn = this.shadowRoot.querySelector("#on")
        let statusOff = this.shadowRoot.querySelector("#off")
        let labelSpan = this.shadowRoot.querySelector("#label")

        if (isDisabled) {
            inputButton.setAttribute("disabled", "disabled")
            inputButton.classList.add("disabled")
            statusOn.classList.add("disabled")
            statusOff.classList.add("disabled")
            labelSpan.classList.add("disabled")
        }

        if (typeof this.currentConfig == "undefined" || !this.currentConfig.getGlobalValue(configName)) {
            deactivate()
        } else {
            activate()
        }

        inputButton.addEventListener('click', function(e) {
            window.dispatchEvent(new CustomEvent('request-config-change', {
                detail: {
                    [configName]: { value: !this.currentConfig.getGlobalValue(configName) }
                }
            }))
        }.bind(this))

        function activate() {
            statusOn.classList.remove("hidden")
            statusOff.classList.add("hidden")
        }

        function deactivate() {
            statusOn.classList.add("hidden")
            statusOff.classList.remove("hidden")
        }
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