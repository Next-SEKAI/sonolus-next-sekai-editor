import type { Command } from '..'
import { state } from '../../../history'
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
        if (view.group === undefined) {
            view.group = state.value.groupCount - 1
        } else if (view.group === 0) {
            view.group = undefined
        } else {
            view.group--
        }
        updateViewLastActive()

        notify(
            view.group === undefined
                ? () => i18n.value.commands.groups.switched.all
                : view.group
                  ? interpolate(() => i18n.value.commands.groups.switched.other, `#${view.group}`)
                  : () => i18n.value.commands.groups.switched.default,
        )
    },
}
