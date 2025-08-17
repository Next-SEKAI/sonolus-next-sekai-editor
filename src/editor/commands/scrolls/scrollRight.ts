import type { Command } from '..'
import { i18n } from '../../../i18n'
import { scrollViewXBy, view } from '../../view'
import ScrollRightIcon from './ScrollRightIcon.vue'

export const scrollRight: Command = {
    title: () => i18n.value.commands.scrolls.scrollRight.title,
    icon: {
        is: ScrollRightIcon,
    },

    execute() {
        scrollViewXBy(view.w * 0.1, true)
    },
}
