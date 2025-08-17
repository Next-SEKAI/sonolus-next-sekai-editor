import type { Command } from '..'
import { i18n } from '../../../i18n'
import { scrollViewYBy, view } from '../../view'
import ScrollDownIcon from './ScrollDownIcon.vue'

export const scrollDown: Command = {
    title: () => i18n.value.commands.scrolls.scrollDown.title,
    icon: {
        is: ScrollDownIcon,
    },

    execute() {
        scrollViewYBy(-view.h * 0.05, true)
    },
}
