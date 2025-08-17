import type { Command } from '..'
import { i18n } from '../../../i18n'
import { notify } from '../../notification'
import { updateViewLastActive, view } from '../../view'
import GroupAllIcon from './GroupAllIcon.vue'

export const groupAll: Command = {
    title: () => i18n.value.commands.groups.groupAll.title,
    icon: {
        is: GroupAllIcon,
    },

    execute() {
        view.group = undefined
        updateViewLastActive()

        notify(() => i18n.value.commands.groups.switched.all)
    },
}
