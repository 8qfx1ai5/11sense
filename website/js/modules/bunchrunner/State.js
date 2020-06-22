import Config from './Config.js'

export default class State {

    taskList = []
    currentTaskIndex = false
    startTime = false
    endTime = false
    config = new Config()
    isRunningActive = false

    getTask(index = false) {
        if (!index) {
            index = this.currentTaskIndex
        }
        if (index in this.taskList) {
            return this.taskList[index]
        }
        return false
    }
}