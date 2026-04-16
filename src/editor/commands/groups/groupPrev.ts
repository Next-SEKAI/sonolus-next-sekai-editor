import type { Command } from '..'
import { groups } from '../../../history/groups'
import { i18n } from '../../../i18n'
import { interpolate } from '../../../utils/interpolate'
import { notify } from '../../notification'
import { updateViewLastActive, view } from '../../view'
import GroupPrevIcon from './GroupPrevIcon.vue'

export const groupPrev: Command = {
    title: () => i18n.value.commands.groups.groupPrev.title,
    icon: {
        is: GroupPrevIcon,
    },

    execute() {
        const ids = [...groups.value.keys()]
        const index = view.group ? ids.indexOf(view.group) : -1

        if (index < 0) {
            view.group = ids.at(-1)
        } else if (index === 0) {
            view.group = undefined
        } else {
            view.group = ids[index - 1]
        }
        updateViewLastActive()

        notify(
            view.group === undefined
                ? () => i18n.value.commands.groups.switched.all
                : interpolate(
                      () => i18n.value.commands.groups.switched.one,
                      groups.value.get(view.group)?.name ?? '',
                  ),
        )
    },
}
