import type { Command } from '..'
import { i18n } from '../../../i18n'
import { showModal } from '../../../modals'
import HelpModal from '../../help/HelpModal.vue'
import HelpIcon from './HelpIcon.vue'

export const help: Command = {
    title: () => i18n.value.commands.help.title,
    icon: {
        is: HelpIcon,
    },

    execute() {
        void showModal(HelpModal, {})
    },
}
