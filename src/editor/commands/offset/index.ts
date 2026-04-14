import type { Command } from '..'
import { i18n } from '../../../i18n'
import { notify } from '../../notification'
import { switchToolTo } from '../../tools'
import OffsetIcon from './OffsetIcon.vue'

export const offset: Command = {
    title: () => i18n.value.commands.offset.title,
    icon: {
        is: OffsetIcon,
    },

    execute() {
        switchToolTo('offset')

        notify(() => i18n.value.commands.offset.switched)
    },
}
