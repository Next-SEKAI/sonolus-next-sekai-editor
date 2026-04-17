import type { Command } from '..'
import { groups } from '../../../history/groups'
import { i18n } from '../../../i18n'
import { interpolate } from '../../../utils/interpolate'
import { notify } from '../../notification'
import { updateViewLastActive, view } from '../../view'
import GroupNextIcon from './GroupNextIcon.vue'

export const groupNext: Command = {
    title: () => i18n.value.commands.groups.groupNext.title,
    icon: {
        is: GroupNextIcon,
    },

    execute() {
        const ids = [...groups.value.keys()]
        const index = view.group ? ids.indexOf(view.group) : -1

        if (index < 0) {
            view.group = ids[0]
        } else if (index === ids.length - 1) {
            view.group = undefined
        } else {
            view.group = ids[index + 1]
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
