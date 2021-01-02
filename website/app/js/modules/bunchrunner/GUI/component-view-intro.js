import * as appRunner from '../bunchRunner.js'
import * as appConfig from '../../config/Config.js'

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
                    padding: 0.5em;
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

        // the initial loading of all texts is currently a hack to enable google translation
        for (const [configId, config] of Object.entries(appConfig.preconfiguredLevels)) {
            let title = document.createElement('span')
            title.innerText = config.title
            title.id = configId + "_title"
            title.classList.add('hidden')
            h2.append(title)

            let description = document.createElement('span')
            description.innerText = config.description
            description.id = configId + "_description"
            description.classList.add('hidden')
            p.append(description)
        }

        appRunner.events.forEach((event) => {
            window.addEventListener(event, function(e) {
                let state = e.detail.state

                if (state.isStarted()) {
                    section.classList.add('hidden')
                    return
                }

                section.classList.remove('hidden')

                // make all labels hidden and then find the right one and show it
                h2.childNodes.forEach(function(item) {
                    item.classList.add('hidden')
                })

                p.childNodes.forEach(function(item) {
                    item.classList.add('hidden')
                })

                let title = h2.querySelector(`#${state.config.configId}_title`)
                if (title) {
                    title.classList.remove('hidden')
                }
                let description = p.querySelector(`#${state.config.configId}_description`)
                if (description) {
                    description.classList.remove('hidden')
                }
            })
        })
    }

})