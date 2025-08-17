import type { Command } from '..'
import { redoState } from '../../../history'
import { i18n } from '../../../i18n'
import { interpolate } from '../../../utils/interpolate'
import { notify } from '../../notification'
import { view } from '../../view'
import RedoIcon from './RedoIcon.vue'

export const redo: Command = {
    title: () => i18n.value.commands.redo.title,
    icon: {
        is: RedoIcon,
    },

    execute() {
        const name = redoState()
        if (name) {
            view.entities = {
                hovered: [],
                creating: [],
            }

            notify(interpolate(() => i18n.value.commands.redo.redid, name))
        } else {
            notify(() => i18n.value.commands.redo.noState)
        }
    },
}
