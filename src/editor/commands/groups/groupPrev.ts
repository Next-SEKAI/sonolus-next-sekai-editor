import { switchToGroup } from '.'
import type { Command } from '..'
import { groups } from '../../../history/groups'
import { i18n } from '../../../i18n'
import { view } from '../../view'
import GroupPrevIcon from './GroupPrevIcon.vue'

export const groupPrev: Command = {
    title: () => i18n.value.commands.groups.groupPrev.title,
    icon: {
        is: GroupPrevIcon,
    },

    execute() {
        const ids = [...groups.value.keys()]
        const index = view.groupId ? ids.indexOf(view.groupId) : -1

        if (index < 0) {
            switchToGroup(ids.at(-1))
        } else if (index === 0) {
            switchToGroup(undefined)
        } else {
            switchToGroup(ids[index - 1])
        }
    },
}
