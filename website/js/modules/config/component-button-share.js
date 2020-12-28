import * as appSystem from '../main/system.js'
import * as appTranslation from '../language/translation.js'

customElements.define('button-share', class extends HTMLElement {

    constructor() {
        super()

        this.attachShadow({ mode: 'open' })

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

            </style>
            <button title="${title}">
                <span id="label">${label}</span>
                <br />
                <span id="sublabel">(${sublabel})</span>
            </button>
        `

        let inputButton = this.shadowRoot.querySelector('button')
        let labelSpan = this.shadowRoot.querySelector('#label')
        let sublabelSpan = this.shadowRoot.querySelector('#sublabel')

        if (isDisabled || !("share" in navigator)) {
            // TODO: provide an alternative for sharing without navigator
            inputButton.setAttribute("disabled", "disabled")
            inputButton.classList.add("disabled")
            labelSpan.classList.add("disabled")
            sublabelSpan.classList.add("disabled")
        }

        inputButton.addEventListener('click', function(e) {
            let shareHeadline = 'The new "11. Sense" learning App'
            let shareText = "Check this out:"
            if (appTranslation.isSelectedLanguageGerman()) {
                shareHeadline = 'Die neue "11. Sense" lern App'
                shareText = "Sieh dir das mal an:"
            }
            navigator
                .share({
                    title: shareHeadline,
                    text: shareText,
                    url: window.location.origin
                })
                .then(() => appSystem.log("Successful shared"), 2)
                .catch(err => {
                    appSystem.log(err, 2, "console")
                    appSystem.log(err.name + ': ' + err.message, 2, "app")
                })
        })
    }
})