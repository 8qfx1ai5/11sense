customElements.define('button-action', class extends HTMLElement {

    constructor() {
        super()

        this.attachShadow({ mode: 'open' })

        let title = this.getAttribute('title')
        let label = this.getAttribute('label')
        let sublabel = this.getAttribute('sublabel')
        let code = this.getAttribute('code')
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

                .hidden {
                    display: none;
                }

            </style>
            <button title="${title}">
                <span id="label">${label}</span>
                <br />
                <span id="sublabel">(${sublabel})</span>
            </button>
        `

        let inputButton = this.shadowRoot.querySelector('button')

        if (isDisabled) {
            inputButton.setAttribute("disabled", "disabled")
            inputButton.classList.add("disabled")
            labelSpan.classList.add("disabled")
        }

        inputButton.addEventListener('click', function(e) {
            eval(code)
        });

    }
})