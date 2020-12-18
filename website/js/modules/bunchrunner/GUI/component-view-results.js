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
                }

                .timedOut {
                    float: right;
                }

                .paused {
                    color: var(--theme-color-3);
                    float: right;
                }

                .answers {
                    color: red;
                    float: right;
                }

                .events {
                    width: 3em;
                    text-align: right;
                    display: inline-block
                }

                .skipped {
                    float: right;
                }

                #results-view {
                    margin: 0em 1em 0em 1em;
                    font-family: monospace;
                }

                li {
                    text-align: right;
                }

                .answer {
                    width: 6em;
                    display: inline-block;
                    text-align: left;
                }

            </style>
            <section id="results-view">
                <ol translate="no" class="notranslate" reversed></ol>
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
                        let text2 = ''
                        if (task.wasSkipped) {
                            text2 += '<span class="skipped">&rarr;</span>'
                        }
                        if (task.wasPaused) {
                            text2 += '<span class="paused">P</span>'
                        }
                        if (task.isSolved && task.answers.length <= 1) {} else if (task.isSolved) {
                            text2 += '<span class="answers">' + (task.answers.length - 1).toString() + '</span>'
                        } else if (task.answers.length == 0) {} else {
                            text2 += '<span class="answers">' + task.answers.length.toString() + '</span>'
                        }
                        if (task.wasTimedOut) {
                            text2 += '<span class="timedOut">T</span>'
                        }
                        if (task.isSolved) {
                            text2 += '<span class="valid">✓</span>'
                        }
                        li.innerHTML = text + '<span class="events">' + text2 + '</span>'
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