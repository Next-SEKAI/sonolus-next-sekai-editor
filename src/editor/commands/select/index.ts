import type { Command } from '..'
import { i18n } from '../../../i18n'
import { notify } from '../../notification'
import { switchToolTo } from '../../tools'
import SelectIcon from './SelectIcon.vue'

export const select: Command = {
    title: () => i18n.value.commands.select.title,
    icon: {
        is: SelectIcon,
    },

    execute() {
        switchToolTo('select')

        notify(() => i18n.value.commands.select.switched)
    },
}
