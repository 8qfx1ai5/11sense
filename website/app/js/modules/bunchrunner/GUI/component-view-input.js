import * as appRunner from '../bunchRunner.js'

customElements.define('view-input', class extends HTMLElement {
    constructor() {
        super()

        this.attachShadow({ mode: 'open' })
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    
                }

                input::-webkit-outer-spin-button,
                input::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }


                /* Firefox */

                input[type=number] {
                    -moz-appearance: textfield;
                }

                .hidden {
                    display: none;
                }

                #input-answer {
                    border: none;
                    text-align: center;
                    width: 90%;
                    height: 1.5em;
                    border-radius: 25px;
                    padding: 0px 00px;
                    font-size: larger;
                    margin-top: 1em;
                    color: var(--theme-color-5);
                    background-color: var(--theme-color-6);
                    font-family: inherit;
                }
                
                #input-answer:focus {
                    outline: none !important;
                }

                .racing-hidden {
                    background-color: var(--theme-color-2) !important;
                    color: var(--theme-color-7) !important;
                    -webkit-text-security: disc;
                    -moz-webkit-text-security: disc;
                    -moz-text-security: disc;
                }

            </style>
            <section id="input-view">
                <input class="hidden" pattern="[0-9]*,?[0-9]*" inputmode="numeric" type="number" id="input-answer" name="input-answer" placeholder="=" onselect="return false;" onfocus="return false;" />
            </section>
        `

        let inputAnswer = this.shadowRoot.getElementById('input-answer')

        appRunner.events.forEach((event) => {
            window.addEventListener(event, function(e) {
                let state = e.detail.state
                let currentTask = state.getTask()

                inputAnswer.value = ""
                if (state.isFinished) {
                    inputAnswer.classList.add('hidden')
                    inputAnswer.disabled = true
                    return
                }

                if (state.config.getValue("isModeRacing") && state.config.isModeHideTask) {
                    inputAnswer.classList.add('racing-hidden')
                } else {
                    inputAnswer.classList.remove('racing-hidden')
                }

                if (currentTask) {
                    inputAnswer.setAttribute("taskindex", state.currentTaskIndex)
                    if (state.config.getValue("isModeRacing")) {
                        inputAnswer.classList.remove('hidden')
                        inputAnswer.disabled = false
                        inputAnswer.focus()
                        if (!state.isActiveTask()) {
                            inputAnswer.disabled = true
                        }
                    } else if (currentTask.wasTimedOut || currentTask.wasSkipped) {
                        inputAnswer.classList.add('hidden')
                        inputAnswer.disabled = true
                    } else if (currentTask.isSolved) {
                        inputAnswer.classList.add('hidden')
                        inputAnswer.disabled = true
                    } else {
                        inputAnswer.classList.remove('hidden')
                        inputAnswer.disabled = false
                        inputAnswer.focus()
                    }
                } else {
                    inputAnswer.classList.add('hidden')
                    inputAnswer.disabled = true
                }
            })
        })

        inputAnswer.addEventListener("keydown", function(e) {

            if (e.keyCode == '13' || e.keyCode == '32') {
                // enter or space
                if (inputAnswer.getAttribute("taskindex") == "") {
                    return
                }
                window.dispatchEvent(new CustomEvent('bunch-request-solution-input', {
                    detail: {
                        input: inputAnswer.value,
                        taskIndex: inputAnswer.getAttribute("taskindex"),
                    }
                }))
            }
        })

        inputAnswer.addEventListener('keyup', () => {
            if (inputAnswer.getAttribute("taskindex") == "") {
                return
            }
            window.dispatchEvent(new CustomEvent('bunch-request-possible-solution-input', {
                detail: {
                    input: inputAnswer.value,
                    taskIndex: inputAnswer.getAttribute("taskindex"),
                }
            }))
        })
    }
})