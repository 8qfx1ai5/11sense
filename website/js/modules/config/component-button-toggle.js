customElements.define('button-toggle', class extends HTMLElement {

    constructor() {
        super()

        this.attachShadow({ mode: 'open' })

        let configName = this.getAttribute('configName')
        let title = this.getAttribute('title')
        let label = this.getAttribute('label')
        let sublabel = this.getAttribute('sublabel')
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

                #status {
                    color: var(--theme-color-8);
                    position: relative;
                    float: right;
                    text-align: right;
                }

                select {
                    width: 4em;
                    height: 2em;
                    position: relative;
                    right: -0.2em;
                    background-color: var(--theme-color-7);
                    font-family: inherit;
                    font-size: inherit;
                    color: var(--theme-color-8);
                    display: inline-block;
                    padding: 0;
                    border: none;
                    text-align: center;
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

        inputButton.addEventListener('click', function(e) {
            let oldValue = localStorage.getItem(configName);
            if (oldValue == 'on') {
                localStorage.setItem(configName, 'off');
            } else {
                localStorage.setItem(configName, 'on');
            }
            window.dispatchEvent(new CustomEvent('config_changed'))
        });

        window.addEventListener("config_changed", function(e) {
            let newValue = localStorage.getItem(configName);
            if (!newValue || newValue == '') {
                localStorage.setItem(configName, defaultOption);
                newValue = defaultOption
            }
            if (newValue == "on") {
                activate();
            } else {
                deactivate();
            }
        })

        function activate() {
            statusOn.classList.remove("hidden");
            statusOff.classList.add("hidden");
        }

        function deactivate() {
            statusOn.classList.add("hidden");
            statusOff.classList.remove("hidden");
        }
    }
})