import RedDownArrow from './RedDownArrow.vue'
import RedDownLeftArrow from './RedDownLeftArrow.vue'
import RedDownRightArrow from './RedDownRightArrow.vue'
import RedUpArrow from './RedUpArrow.vue'
import RedUpLeftArrow from './RedUpLeftArrow.vue'
import RedUpRightArrow from './RedUpRightArrow.vue'
import YellowDownArrow from './YellowDownArrow.vue'
import YellowDownLeftArrow from './YellowDownLeftArrow.vue'
import YellowDownRightArrow from './YellowDownRightArrow.vue'
import YellowUpArrow from './YellowUpArrow.vue'
import YellowUpLeftArrow from './YellowUpLeftArrow.vue'
import YellowUpRightArrow from './YellowUpRightArrow.vue'

export const arrowComponents = {
    red: {
        up: RedUpArrow,
        upLeft: RedUpLeftArrow,
        upRight: RedUpRightArrow,
        down: RedDownArrow,
        downLeft: RedDownLeftArrow,
        downRight: RedDownRightArrow,
    },
    yellow: {
        up: YellowUpArrow,
        upLeft: YellowUpLeftArrow,
        upRight: YellowUpRightArrow,
        down: YellowDownArrow,
        downLeft: YellowDownLeftArrow,
        downRight: YellowDownRightArrow,
    },
}
