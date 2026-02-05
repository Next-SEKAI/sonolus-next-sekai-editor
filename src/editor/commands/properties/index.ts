import type { Command } from '..'
import { pushState, state } from '../../../history'
import { i18n } from '../../../i18n'
import { showModal } from '../../../modals'
import { notify } from '../../notification'
import PropertiesIcon from './PropertiesIcon.vue'
import PropertiesModal from './PropertiesModal.vue'

export const properties: Command = {
    title: () => i18n.value.commands.properties.title,
    icon: {
        is: PropertiesIcon,
    },

    async execute() {
        const newInitialLife = await showModal(PropertiesModal, {
            initialLife: state.value.initialLife,
        })
        if (!newInitialLife) return

        pushState(() => i18n.value.commands.properties.changed, {
            ...state.value,
            initialLife: newInitialLife,
        })

        notify(() => i18n.value.commands.properties.changed)
    },
}
