import * as appRunner from '../bunchRunner.js'

customElements.define('view-intro', class extends HTMLElement {
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

                section {
                    padding-top: 1em;
                }

                h2 {
                    /* font-size: 1em; */
                }

                p {
                    /* font-weight: normal; */
                    /* font-size: smaller; */
                }

            </style>
            <section>
                <h2></h2>
                <p></p>
            </section>
        `

        let section = this.shadowRoot.querySelector('section')
        let h2 = this.shadowRoot.querySelector('h2')
        let p = this.shadowRoot.querySelector('p')

        appRunner.events.forEach((event) => {
            window.addEventListener(event, function(e) {
                let state = e.detail.state

                if (state.isRunning || state.isFinished) {
                    section.classList.add('hidden')
                    return
                }

                section.classList.remove('hidden')
                h2.innerHTML = ""
                let title = document.createElement('span')
                title.innerText = state.config.title
                title.id = state.config.title
                h2.append(title)
                h2.translate = true
                h2.classList.add('translate')
                p.innerHTML = state.config.description
            })
        })
    }

})