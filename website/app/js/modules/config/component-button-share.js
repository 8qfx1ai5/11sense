import * as appSystem from '../main/system.js'

customElements.define('button-share', class extends HTMLElement {

    currentConfig

    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
    }

    render() {
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

                #sublabel {
                    font-size: 0.6em !important;
                }

                #label {
                    display: inline-block;
                }

                #status {
                    color: var(--theme-color-8);
                    position: relative;
                    float: right;
                    text-align: right;
                    opacity: 1;
                }

                .hidden {
                    transition: 2s linear opacity;
                    opacity: 0 !important;
                }

            </style>
            <button title="${title}">
                <span id="label">${label}</span>
                <span id="status" class="hidden">Copied</span>
                <br />
                <span id="sublabel">(${sublabel})</span>
            </button>
        `

        let inputButton = this.shadowRoot.querySelector('button')
        let labelSpan = this.shadowRoot.querySelector('#label')
        let sublabelSpan = this.shadowRoot.querySelector('#sublabel')
        let statusSpan = this.shadowRoot.querySelector('#status')

        if (isDisabled || (!("share" in navigator) && !("clipboard" in navigator))) {
            // TODO: provide an alternative for sharing without navigator
            inputButton.setAttribute("disabled", "disabled")
            inputButton.classList.add("disabled")
            labelSpan.classList.add("disabled")
            sublabelSpan.classList.add("disabled")
        }

        inputButton.addEventListener('click', function(e) {
            let shareHeadline = "Check this out"
            let shareText = 'Found something new: the "11. Sense" learn App \n'

            // ignore paging information in the link
            let shareURL = window.location.origin + window.location.pathname
            if (this.currentConfig.getGlobalValue('selectedLanguage') == "de-DE") {
                // TODO: implement generic translation
                shareHeadline = "Sieh dir das mal an"
                shareText = 'Hab was Neues gefunden: die "11. Sense" lern App \n'
            }
            if ("share" in navigator) {
                navigator
                    .share({
                        title: shareHeadline,
                        text: shareText,
                        url: shareURL
                    })
                    .then(() => appSystem.log("Successfully shared"), 2)
                    .catch(err => {
                        appSystem.log(err, 2, "console")
                        appSystem.log(err.name + ': ' + err.message, 2, "app")
                    })
            } else if ("clipboard" in navigator) {
                let text = `${shareText}${shareURL}`
                navigator.clipboard.writeText(text)
                    .then(() => {
                        appSystem.log('Successfully shared by copy to clipboard')
                        statusSpan.classList.remove("hidden")
                        setTimeout(function() {
                            statusSpan.classList.add("hidden")
                        }, 1000)
                    })
                    .catch(err => {
                        appSystem.log(err, 2, "console")
                        appSystem.log(err.name + ': ' + err.message, 2, "app")
                    })
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