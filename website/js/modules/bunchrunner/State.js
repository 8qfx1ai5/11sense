import Config from './Config.js'

export default class State {

    taskList = []
    currentTaskIndex = false
    startTime = false
    endTime = false
    config = new Config()
    isRunning = false
    isFinished = false

    getTask(index = false) {
        if (index !== 0 && !index) {
            index = this.currentTaskIndex
        }
        if (index in this.taskList) {
            return this.taskList[index]
        }
        return false
    }

    getLastTask() {
        return this.getTask(this.currentTaskIndex - 1)
    }

    isFirstTask() {
        return this.currentTaskIndex == 0
    }

    getEclapsedTime() {
        return this.endTime - this.startTime
    }
}