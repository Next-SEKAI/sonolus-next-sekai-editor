import type { Command } from '..'
import { checkState, resetState } from '../../../history'
import { i18n } from '../../../i18n'
import { notify } from '../../notification'
import ResetIcon from './ResetIcon.vue'

export const reset: Command = {
    title: () => i18n.value.commands.reset.title,
    icon: {
        is: ResetIcon,
    },

    async execute() {
        if (!(await checkState())) return

        resetState()

        notify(() => i18n.value.commands.reset.reset)
    },
}
