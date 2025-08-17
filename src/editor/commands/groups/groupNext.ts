import type { Command } from '..'
import { state } from '../../../history'
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
        if (view.group === undefined) {
            view.group = 0
        } else if (view.group === state.value.groupCount - 1) {
            view.group = undefined
        } else {
            view.group++
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
