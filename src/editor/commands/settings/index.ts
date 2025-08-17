import type { Command } from '..'
import { i18n } from '../../../i18n'
import { showModal } from '../../../modals'
import SettingsModal from '../../settings/SettingsModal.vue'
import SettingsIcon from './SettingsIcon.vue'

export const settings: Command = {
    title: () => i18n.value.commands.settings.title,
    icon: {
        is: SettingsIcon,
    },

    execute() {
        void showModal(SettingsModal, {})
    },
}
