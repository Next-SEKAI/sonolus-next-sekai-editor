import type { Command } from '.'
import { i18n } from '../../i18n'
import { notify } from '../notification'
import { switchToolTo } from '../tools'
import TextIcon from './TextIcon.vue'

export const bpm: Command = {
    title: () => i18n.value.commands.bpm.title,
    icon: {
        is: TextIcon,
        props: {
            title: 'BPM',
            class: 'text-[#f0f]',
        },
    },

    execute() {
        switchToolTo('bpm')

        notify(() => i18n.value.commands.bpm.switched)
    },
}
