import * as Main from './modules/main/main.js'
import { appVoice } from './modules/conversation/voice.js'
import * as appSound from './modules/conversation/sound.js'
import { appConversation } from './modules/conversation/conversation.js'
import * as appStatistics from './modules/statistics/statistics.js'
import * as appSystem from './modules/main/system.js'
import * as appMath from './modules/math/math.js'
import { appNotification } from './modules/notification/onboarding.js'
import { appTask } from './modules/task/task-view.js'
import { appSolution } from './modules/task/solution-view.js'
import { appDev } from './modules/dev/dev-view.js'
import * as appPage from './modules/page/page.js'
import * as appTranslation from './modules/language/translation.js'

// TODO: rethink race conditons, currently init order matters
appDev.init()
Main.init()
appVoice.init()
appSound.init()
appConversation.init()
appStatistics.init()
appSystem.init()
appMath.init()
appTask.init()
appSolution.init()
appPage.init()
appTranslation.init()

appMath.newTask()