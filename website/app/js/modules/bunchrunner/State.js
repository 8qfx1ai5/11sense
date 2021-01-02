import Config from '../config/Config.js'

export default class State {

    taskList = []
    currentTaskIndex = false
    activeTask = false
    startTime = false
    endTime = false
    config = new Config()
    isRunning = false
    isFinished = false
    date = new Date()

    getTask(index = false) {
        if (index !== 0 && !index) {
            index = this.currentTaskIndex
        }
        if (index in this.taskList) {
            return this.taskList[index]
        }
        return false
    }

    getPreviousTask() {
        return this.getTask(this.currentTaskIndex - 1)
    }

    getNextTask() {
        return this.getTask(this.currentTaskIndex + 1)
    }

    getFirstTask() {
        return this.getTask(0)
    }

    getLastTask() {
        return this.getTask(this.taskList.length - 1)
    }

    isFirstTask() {
        return this.currentTaskIndex === 0
    }

    isLastTask() {
        return this.currentTaskIndex === this.taskList.length - 1
    }

    isActiveTask() {
        if (this.isLastTask()) {
            return this.getTask().isRunning()
        }
        let nextTask = this.getNextTask()
        return !nextTask.isRunning() && nextTask.isNew()
    }

    getEclapsedTime() {
        return this.endTime - this.startTime
    }

    getNumberOfTasks() {
        return this.taskList.length + 1
    }
}