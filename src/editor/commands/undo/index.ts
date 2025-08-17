import type { Command } from '..'
import { undoState } from '../../../history'
import { i18n } from '../../../i18n'
import { interpolate } from '../../../utils/interpolate'
import { notify } from '../../notification'
import { view } from '../../view'
import UndoIcon from './UndoIcon.vue'

export const undo: Command = {
    title: () => i18n.value.commands.undo.title,
    icon: {
        is: UndoIcon,
    },

    execute() {
        const name = undoState()
        if (name) {
            view.entities = {
                hovered: [],
                creating: [],
            }

            notify(interpolate(() => i18n.value.commands.undo.undid, name))
        } else {
            notify(() => i18n.value.commands.undo.noState)
        }
    },
}
