import State from './State.js'
import Multiplication from './Multiplication.js'
import Addition from './Addition.js'
import Config from './Config.js'

export function create(state = new State()) {
    for (let i = 0; i < state.config.bunchSize; i++) {
        state.taskList.push(new Addition(state.config))
    }
    return state
}