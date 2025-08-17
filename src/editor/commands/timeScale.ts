import type { Command } from '.'
import { i18n } from '../../i18n'
import { notify } from '../notification'
import { switchToolTo } from '../tools'
import TextIcon from './TextIcon.vue'

export const timeScale: Command = {
    title: () => i18n.value.commands.timeScale.title,
    icon: {
        is: TextIcon,
        props: {
            title: 'TS',
            class: 'text-[#ff0]',
        },
    },

    execute() {
        switchToolTo('timeScale')

        notify(() => i18n.value.commands.timeScale.switched)
    },
}
