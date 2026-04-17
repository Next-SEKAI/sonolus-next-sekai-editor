import type { Command } from '..'
import { i18n } from '../../../i18n'
import { showModal } from '../../../modals'
import ManageGroupsModal from './manageGroups/ManageGroupsModal.vue'
import ManageGroupsIcon from './ManageGroupsIcon.vue'

export const manageGroups: Command = {
    title: () => i18n.value.commands.manageGroups.title,
    icon: {
        is: ManageGroupsIcon,
    },

    execute() {
        void showModal(ManageGroupsModal, {})
    },
}
