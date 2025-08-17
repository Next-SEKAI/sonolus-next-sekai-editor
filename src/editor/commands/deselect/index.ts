import type { Command } from '..'
import { replaceState, state } from '../../../history'
import { selectedEntities } from '../../../history/selectedEntities'
import { i18n } from '../../../i18n'
import { notify } from '../../notification'
import { view } from '../../view'
import DeselectIcon from './DeselectIcon.vue'

export const deselect: Command = {
    title: () => i18n.value.commands.deselect.title,
    icon: {
        is: DeselectIcon,
    },

    execute() {
        if (!selectedEntities.value.length) return

        replaceState({
            ...state.value,
            selectedEntities: [],
        })
        view.entities = {
            hovered: [],
            creating: [],
        }

        notify(() => i18n.value.commands.deselect.deselected)
    },
}
