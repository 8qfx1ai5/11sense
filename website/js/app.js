import * as Main from './modules/main/main.js'
import * as appVoice from './modules/bunchrunner/SUI/voice.js'
import * as appSound from './modules/bunchrunner/SUI/sound.js'
import * as appConversation from './modules/bunchrunner/SUI/conversation.js'
import * as appStatistics from './modules/statistics/statistics.js'
import * as appSystem from './modules/main/system.js'
import * as appMath from './modules/math/math.js'
import * as appNotification from './modules/notification/onboarding.js'
import * as appTask from './modules/bunchrunner/GUI/task-runner.js'
import * as appSolution from './modules/bunchrunner/GUI/solution-view.js'
import * as panelBunchControl from './modules/bunchrunner/GUI/panel-bunch-control.js'
import * as appDev from './modules/dev/dev-view.js'
import * as appPage from './modules/page/page.js'
import * as appTranslation from './modules/language/translation.js'
import * as bunchrunner from './modules/bunchrunner/bunchRunner2.js'

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
bunchrunner.init()

window.dispatchEvent(new CustomEvent('bunch-request-new'))