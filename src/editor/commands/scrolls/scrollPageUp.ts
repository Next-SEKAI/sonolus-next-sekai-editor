import type { Command } from '..'
import { i18n } from '../../../i18n'
import { scrollViewYBy, view } from '../../view'
import ScrollPageUpIcon from './ScrollPageUpIcon.vue'

export const scrollPageUp: Command = {
    title: () => i18n.value.commands.scrolls.scrollPageUp.title,
    icon: {
        is: ScrollPageUpIcon,
    },

    execute() {
        scrollViewYBy(view.h, true)
    },
}
