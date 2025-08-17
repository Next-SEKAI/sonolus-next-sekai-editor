import type { Command } from '..'
import { i18n } from '../../../i18n'
import { showModal } from '../../../modals'
import UtilitiesModal from '../../utilities/UtilitiesModal.vue'
import UtilitiesIcon from './UtilitiesIcon.vue'

export const utilities: Command = {
    title: () => i18n.value.commands.utilities.title,
    icon: {
        is: UtilitiesIcon,
    },

    execute() {
        void showModal(UtilitiesModal, {})
    },
}
