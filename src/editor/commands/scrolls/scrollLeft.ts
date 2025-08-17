import type { Command } from '..'
import { i18n } from '../../../i18n'
import { scrollViewXBy, view } from '../../view'
import ScrollLeftIcon from './ScrollLeftIcon.vue'

export const scrollLeft: Command = {
    title: () => i18n.value.commands.scrolls.scrollLeft.title,
    icon: {
        is: ScrollLeftIcon,
    },

    execute() {
        scrollViewXBy(-view.w * 0.1, true)
    },
}
