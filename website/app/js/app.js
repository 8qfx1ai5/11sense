import * as Main from './modules/main/main.js'
import * as appConversation from './modules/bunchrunner/SUI/conversation.js'
import * as appStatistics from './modules/statistics/statistics.js'
import * as appSystem from './modules/main/system.js'
import * as appMath from './modules/math/math.js'
import * as appNotification from './modules/notification/onboarding.js'
import * as appViewTask from './modules/bunchrunner/GUI/component-view-task.js'
import * as appViewTaskVertical from './modules/bunchrunner/GUI/component-view-task-vertical.js'
import * as appViewInput from './modules/bunchrunner/GUI/component-view-input.js'
import * as appViewResults from './modules/bunchrunner/GUI/component-view-results.js'
import * as appViewIntro from './modules/bunchrunner/GUI/component-view-intro.js'
import * as appPanelBunchControl from './modules/bunchrunner/GUI/component-panel-bunch-control.js'
import * as appButtonSelect from './modules/config/component-button-select.js'
import * as appButtonToggle from './modules/config/component-button-toggle.js'
import * as appButtonLink from './modules/config/component-button-link.js'
import * as appButtonAction from './modules/config/component-button-action.js'
import * as appButtonShare from './modules/config/component-button-share.js'
import * as appSolution from './modules/bunchrunner/GUI/solution-view.js'
import * as appDev from './modules/dev/dev-view.js'
import * as appPage from './modules/page/page.js'
import * as appTranslation from './modules/language/translation.js'
import * as bunchrunner from './modules/bunchrunner/bunchRunner.js'
import * as appConfig from './modules/config/Config.js'

// TODO: rethink race conditons, currently init order matters
appDev.init()
Main.init()
appConversation.init()
appStatistics.init()
appSystem.init()
appConfig.init()
appSolution.init()
appPage.init()
appTranslation.init()
bunchrunner.init()

window.dispatchEvent(new CustomEvent('config_changed'))