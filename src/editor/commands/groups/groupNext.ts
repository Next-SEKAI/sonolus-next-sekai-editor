import { switchToGroup } from '.'
import type { Command } from '..'
import { groups } from '../../../history/groups'
import { i18n } from '../../../i18n'
import { view } from '../../view'
import GroupNextIcon from './GroupNextIcon.vue'

export const groupNext: Command = {
    title: () => i18n.value.commands.groups.groupNext.title,
    icon: {
        is: GroupNextIcon,
    },

    execute() {
        const ids = [...groups.value.keys()]
        const index = view.groupId ? ids.indexOf(view.groupId) : -1

        if (index < 0) {
            switchToGroup(ids[0])
        } else if (index === ids.length - 1) {
            switchToGroup(undefined)
        } else {
            switchToGroup(ids[index + 1])
        }
    },
}
