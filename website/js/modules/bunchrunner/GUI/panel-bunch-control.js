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
                    width: 2.5em;
                    font-size: 0.5em;
                    color: var(--theme-color-1);
                    background-color: var(--theme-color-2);
                    border: 1px solid var(--theme-color-1);
                    font-size: 1em;
                }

                button:disabled {
                    color: black;
                    border-color: black;
                }

                button:focus {
                    outline: none;
                }

                #button-next-task {
                    letter-spacing: -0.3em;
                    border-radius: 0px 20px 20px 0px;
                }

                #button-previous-task {
                    letter-spacing: -0.3em;
                    border-radius: 20px 0px 0px 20px;
                }

                #button-display {
                    width: 3.5em;
                    border-color: black;
                }

                .hidden {
                    display: none;
                }

                .clicked {
                    background-color: var(--theme-color-1);
                }

                #button-pause
            </style>
            <div id="panel-bunch-control">
                <button id="button-previous-task" disabled="true">&#9668;&#9668;</button>
                <button id="button-display"></button>
                <button id="button-pause" class="hidden">&#x275A; &#x275A;</button>
                <button id="button-play">&#9658;</button>
                <button id="button-next-task" disabled="true">&#9658;&#9658;</button>
            </div>
        `

        let buttonPlay = this.shadowRoot.getElementById('button-play')
        let buttonPause = this.shadowRoot.getElementById('button-pause')
        let inputSolution = document.getElementById('solution')

        buttonPlay.addEventListener('click', () => {
            buttonPlay.disabled = true
            buttonPlay.classList.add('clicked')
            inputSolution.focus()
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
            inputSolution.focus()
            this.dispatchEvent(new CustomEvent('bunch-request-runner-pause', {
                bubbles: true,
                composed: true
            }))
        })

        let buttonNextTask = this.shadowRoot.getElementById('button-next-task')
        buttonNextTask.addEventListener('click', () => {
            inputSolution.focus()
            this.dispatchEvent(new CustomEvent('bunch-request-next-task', {
                bubbles: true,
                composed: true
            }))
        })
        let buttonPreviousTask = this.shadowRoot.getElementById('button-previous-task')
        buttonPreviousTask.addEventListener('click', () => {
            inputSolution.focus()
            this.dispatchEvent(new CustomEvent('bunch-request-previous-task', {
                bubbles: true,
                composed: true
            }))
        })

        window.addEventListener('bunch-action-start', () => {
            buttonPlay.classList.add('hidden')
            buttonPause.classList.remove('hidden')
            buttonPause.classList.remove('clicked')
            buttonPause.disabled = false
        })

        window.addEventListener('bunch-action-pause', () => {
            buttonPlay.classList.remove('hidden')
            buttonPause.classList.add('hidden')
            buttonPlay.disabled = false
            buttonPlay.classList.remove('clicked')
        })

        let events = [
            'bunch-action-start',
            'bunch-action-pause',
            'bunch-action-task-next',
            'bunch-action-task-previous',
            'bunch-action-solution-found',
            'bunch-action-solution-partial-found',
            'bunch-action-solution-invalid',
            'bunch-action-solution-timed-out',
            'bunch-action-new',
        ]
        let buttonDisplay = this.shadowRoot.getElementById('button-display')

        events.forEach((event) => {
            window.addEventListener(event, function(e) {
                let state = e.detail.state
                let currentTask = state.taskList[state.currentTaskIndex]
                let currentTaskIndex = "-"
                if (state.currentTaskIndex !== false) {
                    currentTaskIndex = state.currentTaskIndex + 1
                    if (currentTask.wasSkipped || currentTask.wasTimeOut) {
                        currentTaskIndex = "<span style='text-decoration: line-through;text-decoration-color: red;'>" + currentTaskIndex + '</span>'
                    }
                    if (0 < state.currentTaskIndex) {
                        buttonPreviousTask.disabled = false
                    } else {
                        buttonPreviousTask.disabled = true
                    }
                    if (state.currentTaskIndex + 1 < state.taskList.length) {
                        buttonNextTask.disabled = false
                    } else {
                        buttonNextTask.disabled = true
                    }
                } else {
                    buttonNextTask.disabled = true
                    buttonPreviousTask.disabled = true
                }
                let numberOfTasks = "-"
                if (state.taskList.length) {
                    numberOfTasks = state.taskList.length
                }
                buttonDisplay.innerHTML = currentTaskIndex + "/" + numberOfTasks
            })
        })
    }

})