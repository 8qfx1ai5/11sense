import * as appRunner from '../bunchRunner.js'

customElements.define('view-task-vertical', class extends HTMLElement {
    constructor() {
        super()

        this.attachShadow({ mode: 'open' })
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    
                }

                #root {
                    height: 6em;
                    display: block;
                    transition: 1s linear all;
                }

                .success {
                    background-color: var(--theme-color-4);
                    transition: none !important;
                }

                .hidden {
                    display: none !important;
                    transition: none !important;
                }

                .value {
                    color: var(--theme-color-3);
                }

                .operation {
                    color: var(--theme-color-1);
                }

                #view-task-vertical {
                    display: inline-block;
                }

                .solved .answer::after {
                    content: " ✓";
                }

                .solved .answer {
                    color: var(--theme-color-4);
                    -webkit-text-stroke: 2px var(--theme-color-2);
                }

                .question > * {
                    display: block;
                }

                .question {
                    display: flex;
                    flex-direction: column-reverse;
                }
            </style>
            <p id="root"><span id="task-view-vertical"></span></p>
        `

        let taskView = this.shadowRoot.getElementById('task-view-vertical')
        let taskViewRoot = this.shadowRoot.getElementById('root')

        appRunner.events.forEach((event) => {
            window.addEventListener(event, function(e) {
                let state = e.detail.state
                let currentTask = state.getTask()

                if (!state.config.isRacingMode) {
                    taskView.classList.add('hidden')
                    return
                }

                if (state.isFinished) {
                    taskView.classList.add('hidden')
                    taskViewRoot.classList.remove('success')
                    taskViewRoot.classList.add('hidden')
                    return
                }

                if (currentTask) {
                    if (state.config.isHideTaskModeActive) {
                        if (state.isFirstTask()) {
                            taskView.classList.remove('hidden')
                            taskViewRoot.classList.remove('hidden')
                        } else if (!state.isActiveTask()) {
                            taskView.classList.remove('hidden')
                        } else {
                            taskView.classList.add('hidden')
                        }
                        if (currentTask.isSolved && state.isActiveTask()) {
                            taskViewRoot.classList.add('success')
                        } else {
                            taskViewRoot.classList.remove('success')
                        }
                    } else {
                        taskView.classList.remove('hidden')
                    }
                    if (currentTask.wasTimedOut || currentTask.wasSkipped) {
                        taskView.innerHTML = "<span class='guided'>" + currentTask.questionGUI + " <span class='equals-sign'>=</span> " + currentTask.answerGUI + "</span>"
                    } else if (currentTask.isSolved) {
                        taskView.innerHTML = "<span class='solved'>" + currentTask.questionGUI + " <span class='equals-sign'>=</span> " + currentTask.answerGUI + "</span>"
                    } else {
                        taskView.innerHTML = currentTask.questionGUI
                    }
                } else {
                    taskView.classList.add('hidden')
                    taskViewRoot.classList.remove('success')
                }
            })
        })
    }

})