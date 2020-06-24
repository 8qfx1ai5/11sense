import * as appRunner from '../bunchRunner.js'

customElements.define('view-results', class extends HTMLElement {
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

                .valid {
                    color: var(--theme-color-4);
                    float: right;
                    font-family: monospace
                }

                .timedOut {
                    float: right;
                    font-family: monospace
                }

                .paused {
                    color: var(--theme-color-3);
                    float: right;
                    font-family: monospace
                }

                .answers {
                    color: red;
                    float: right;
                    font-family: monospace
                }

                .skipped {
                    float: right;
                    font-family: monospace
                }

            </style>
            <section id="results-view">
                <ol reversed></ol>
            </section>
        `

        let resultsList = this.shadowRoot.querySelector('ol')

        appRunner.events.forEach((event) => {
            window.addEventListener(event, function(e) {
                let state = e.detail.state

                if (state.isFinished) {
                    resultsList.innerHTML = ''
                    for (let i = state.taskList.length - 1; 0 <= i; i--) {
                        let task = state.taskList[i]
                        let li = document.createElement('li')
                        let text = task.questionGUI + ' = ' + task.answerGUI
                        if (task.wasSkipped) {
                            text += '<span class="skipped">&rarr;</span>'
                        } else {
                            text += '<span class="skipped">&nbsp;</span>'
                        }
                        if (task.wasPaused) {
                            text += '<span class="paused">P</span>'
                        } else {
                            text += '<span class="paused">&nbsp;</span>'
                        }
                        if (task.isSolved && task.answers.length <= 1) {
                            text += '<span class="answers">&nbsp;</span>'
                        } else if (task.isSolved) {
                            text += '<span class="answers">' + (task.answers.length - 1).toString() + '</span>'
                        } else if (task.answers.length == 0) {
                            text += '<span class="answers">&nbsp;</span>'
                        } else {
                            text += '<span class="answers">' + task.answers.length.toString() + '</span>'
                        }
                        if (task.wasTimedOut) {
                            text += '<span class="timedOut">T</span>'
                        } else {
                            text += '<span class="timedOut">&nbsp;</span>'
                        }
                        if (task.isSolved) {
                            text += '<span class="valid">✓</span>'
                        } else {
                            text += '<span class="valid">&nbsp;</span>'
                        }
                        li.innerHTML = text
                        resultsList.append(li)
                    }
                    resultsList.classList.remove('hidden')
                    return
                } else {
                    resultsList.classList.add('hidden')
                }
            })
        })
    }
})