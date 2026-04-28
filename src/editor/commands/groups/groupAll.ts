import { switchToGroup } from '.'
import type { Command } from '..'
import { i18n } from '../../../i18n'
import GroupAllIcon from './GroupAllIcon.vue'

export const groupAll: Command = {
    title: () => i18n.value.commands.groups.groupAll.title,
    icon: {
        is: GroupAllIcon,
    },

    execute() {
        switchToGroup(undefined)
    },
}
