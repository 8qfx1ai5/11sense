import State from './State.js'
import Multiplication from './Multiplication.js'
import Addition from './Addition.js'
import Config from '../config/ConfigStateMachine.js'

export function create(state = new State()) {
    if (state.config.getValue('selectedOperator') == '*') {
        for (let i = 0; i < state.config.getValue('bunchSize'); i++) {
            state.taskList.push(new Multiplication(state.config, i))
        }
        return state
    }
    for (let i = 0; i < state.config.getValue('bunchSize'); i++) {
        state.taskList.push(new Addition(state.config, i))
    }
    return state
}