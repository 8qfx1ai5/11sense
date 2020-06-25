import * as appRunner from '../bunchRunner.js'

customElements.define('panel-bunch-control', class extends HTMLElement {
    constructor() {
        super()

        this.attachShadow({ mode: 'open' })
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    width: 100%;
                    top: 15px;
                    position: relative;
                }

                button {
                    width: 2em;
                    color: var(--theme-color-1);
                    background-color: var(--theme-color-2);
                    border: 1px solid var(--theme-color-1);
                    font-size: 1em;
                    /* line-height: 1em; */
                    /* padding: 0.1em 0em 0em 0em; */
                    vertical-align: middle;
                    height: 1.2em;
                }

                button:disabled {
                    color: black;
                    border-color: black;
                }

                button:focus {
                    outline: none;
                }

                .play-sign {
                    width: 0.8em;
                    height: 0.8em;
                    border-style: solid;
                    border-color: transparent transparent transparent var(--theme-color-1);
                    border-width: 0.4em 0em 0.4em 0.8em;
                    box-sizing: border-box;
                    margin: auto;
                    display: block;
                }

                .stop-sign {
                    width: 0.6em;
                    height: 0.6em;
                    border-style: solid;
                    border-color: var(--theme-color-1);
                    border-width: 0.3em;
                    box-sizing: border-box;
                    margin: auto;
                    display: block;
                }

                .pause-sign {
                    width: 0.8em;
                    height: 0.8em;
                    border-style: double;
                    border-color: var(--theme-color-1);
                    border-width: 0em 0em 0em 0.8em;
                    margin: auto;
                    display: block;
                    box-sizing: border-box;
                }

                .restart-sign {
                    width: 0.8em;
                    height: 0.8em;
                    position: relative;
                    top: -0.25em;
                }

                .next-sign {
                    width: 0.6em;
                    height: 0.8em;
                    border-style: solid;
                    border-color: transparent transparent transparent var(--theme-color-1);
                    border-width: 0.4em 0em 0.4em 0.6em;
                    box-sizing: border-box;
                    margin: auto;
                    display: block;
                    float: left;
                }

                button:disabled .stop-sign {
                    border-color: black;
                }

                button:disabled .play-sign,
                button:disabled .next-sign {
                    border-color: transparent transparent transparent black;
                }

                #button-submit {
                    border-radius: 0px 20px 20px 0px;
                }

                #button-next-task,
                #button-previous-task {
                    letter-spacing: -0.2em;
                    border-radius: 0px 20px 20px 0px;
                    padding-left: 0.3em;
                }

                #button-display {
                    width: 3em;
                    border-color: black;
                }

                #button-stop {
                    width: 3em;
                }

                #button-display:hover {
                    border-color: inherit;
                }

                .rotate{
                    -moz-transform: rotate(-180deg);
                    -ms-transform: rotate(-180deg);
                    -o-transform: rotate(-180deg);
                    -webkit-transform: rotate(-180deg);
                    transform: rotate(-180deg);
                }

                .hidden {
                    display: none;
                }

                .clicked {
                    background-color: var(--theme-color-1);
                }

                .invalid {
                    text-decoration: line-through;
                    text-decoration-color: var(--theme-color-3);
                }
            </style>
            <div id="panel-bunch-control">
                <button id="button-previous-task" class="rotate" disabled="true"><span class="next-sign"></span><span class="next-sign"></span></button>
                <button id="button-display">-/-</button>
                <button id="button-stop" class="hidden"><span class="stop-sign"></span></button>
                <button id="button-pause" class="hidden"><span class="pause-sign"></span></button>
                <button id="button-play"><span class="play-sign"></span></button>
                <button id="button-restart" class="hidden"><span class="restart-sign">&#10227;</span></button>
                <button id="button-next-task" disabled="true"><span class="next-sign"></span><span class="next-sign"></span></button>
                <button id="button-submit" disabled="true" class="hidden">✓</button>
            </div>
        `

        let buttonPlay = this.shadowRoot.getElementById('button-play')
        let buttonPause = this.shadowRoot.getElementById('button-pause')

        buttonPlay.addEventListener('click', () => {
            buttonPlay.disabled = true
            buttonPlay.classList.add('clicked')
            this.dispatchEvent(new CustomEvent('bunch-request-runner-start', {
                bubbles: true,
                composed: true
            }))
            setTimeout(() => {
                buttonPlay.disabled = false
                buttonPlay.classList.remove('clicked')
            }, 500)
        })

        buttonPause.addEventListener('click', () => {
            buttonPause.disabled = true
            this.dispatchEvent(new CustomEvent('bunch-request-runner-pause', {
                bubbles: true,
                composed: true
            }))
        })

        let buttonNextTask = this.shadowRoot.getElementById('button-next-task')
        buttonNextTask.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('bunch-request-next-task', {
                bubbles: true,
                composed: true
            }))
        })
        let buttonPreviousTask = this.shadowRoot.getElementById('button-previous-task')
        buttonPreviousTask.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('bunch-request-previous-task', {
                bubbles: true,
                composed: true
            }))
        })

        let buttonSubmit = this.shadowRoot.getElementById('button-submit')
        buttonSubmit.addEventListener('click', () => {
            buttonSubmit.disabled = true
            this.dispatchEvent(new CustomEvent('bunch-request-submit', {
                bubbles: true,
                composed: true
            }))
        })

        let buttonRestart = this.shadowRoot.getElementById('button-restart')
        buttonRestart.addEventListener('click', () => {
            buttonRestart.disabled = true
            this.dispatchEvent(new CustomEvent('bunch-request-new', {
                bubbles: true,
                composed: true
            }))
        })

        let buttonDisplay = this.shadowRoot.getElementById('button-display')
        let buttonStop = this.shadowRoot.getElementById('button-stop')
        buttonDisplay.addEventListener('click', () => {
            buttonDisplay.classList.add('hidden')
            buttonStop.classList.remove('hidden')
            setTimeout(() => {
                buttonDisplay.classList.remove('hidden')
                buttonStop.classList.add('hidden')
            }, 1500)
        })

        buttonStop.addEventListener('click', () => {
            buttonStop.disabled = true
            this.dispatchEvent(new CustomEvent('bunch-request-new', {
                bubbles: true,
                composed: true
            }))
        })

        appRunner.events.forEach((event) => {
            window.addEventListener(event, function(e) {
                let state = e.detail.state
                let currentTask = state.getTask()
                let currentTaskIndex = "-"
                if (state.currentTaskIndex !== false) {
                    currentTaskIndex = state.currentTaskIndex + 1
                    if (currentTask.wasSkipped || currentTask.wasTimedOut || currentTask.wasPaused) {
                        currentTaskIndex = "<span class='invalid'>" + currentTaskIndex + '</span>'
                    }
                    if (0 < state.currentTaskIndex) {
                        buttonPreviousTask.disabled = false
                    } else {
                        buttonPreviousTask.disabled = true
                    }
                    if (state.isFinished) {
                        buttonSubmit.disabled = true
                        buttonSubmit.classList.remove('hidden')
                        buttonNextTask.disabled = true
                        buttonNextTask.classList.add('hidden')
                        buttonPreviousTask.disabled = true
                    } else if (state.currentTaskIndex + 1 < state.taskList.length) {
                        buttonNextTask.disabled = false
                        buttonNextTask.classList.remove('hidden')
                        buttonSubmit.disabled = true
                        buttonSubmit.classList.add('hidden')
                    } else {
                        buttonNextTask.disabled = true
                        buttonNextTask.classList.add('hidden')
                        buttonSubmit.disabled = false
                        buttonSubmit.classList.remove('hidden')
                    }
                    buttonStop.disabled = false
                } else {
                    buttonNextTask.disabled = true
                    buttonNextTask.classList.remove('hidden')
                    buttonPreviousTask.disabled = true
                    buttonSubmit.disabled = true
                    buttonSubmit.classList.add('hidden')
                    buttonStop.disabled = true
                }
                let numberOfTasks = "-"
                if (state.taskList.length) {
                    numberOfTasks = state.taskList.length
                }
                buttonDisplay.innerHTML = currentTaskIndex + "/" + numberOfTasks

                if (state.isRunning && !state.isFinished) {
                    buttonPlay.classList.add('hidden')
                    buttonPause.classList.remove('hidden')
                    buttonPause.classList.remove('clicked')
                    buttonPause.disabled = false
                } else {
                    buttonPlay.classList.remove('hidden')
                    buttonPause.classList.add('hidden')
                    buttonPlay.disabled = false
                    buttonPlay.classList.remove('clicked')
                }

                if (state.isFinished) {
                    buttonRestart.classList.remove('hidden')
                    buttonRestart.disabled = false
                    buttonPlay.classList.add('hidden')
                    buttonPlay.disabled = true
                    buttonPause.classList.add('hidden')
                    buttonPause.disabled = true
                    buttonStop.disabled = true
                } else {
                    buttonRestart.classList.add('hidden')
                    buttonRestart.disabled = true
                }
            })
        })
    }
})