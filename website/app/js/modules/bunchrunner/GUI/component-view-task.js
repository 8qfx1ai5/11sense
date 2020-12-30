import * as appRunner from '../bunchRunner.js'

customElements.define('view-task', class extends HTMLElement {
    constructor() {
        super()

        this.attachShadow({ mode: 'open' })
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    
                }

                .hidden {
                    display: none;
                }

                .value {
                    color: var(--theme-color-3);
                }

                .operation {
                    color: var(--theme-color-1);
                }

                #view-task {
                    display: inline-block;
                }

                .solved .answer::after {
                    content: " ✓";
                }

                .solved .answer {
                    color: var(--theme-color-4);
                }
            </style>
            <p><span id="task-view"></span></p>
        `

        let taskView = this.shadowRoot.getElementById('task-view')

        appRunner.events.forEach((event) => {
            window.addEventListener(event, function(e) {
                let state = e.detail.state
                if (state.config.isRacingMode) {
                    taskView.classList.add('hidden')
                    return
                }

                let currentTask = state.getTask()

                if (state.isFinished) {
                    taskView.classList.add('hidden')
                    return
                }

                if (currentTask) {
                    taskView.classList.remove('hidden')
                    if (currentTask.wasTimedOut || currentTask.wasSkipped) {
                        taskView.innerHTML = "<span class='guided'>" + currentTask.questionGUI + " <span class='equals-sign'>=</span> " + currentTask.answerGUI + "</span>"
                    } else if (currentTask.isSolved) {
                        taskView.innerHTML = "<span class='solved'>" + currentTask.questionGUI + " <span class='equals-sign'>=</span> " + currentTask.answerGUI + "</span>"
                    } else {
                        taskView.innerHTML = currentTask.questionGUI
                    }
                } else {
                    taskView.classList.add('hidden')
                }
            })
        })
    }

})