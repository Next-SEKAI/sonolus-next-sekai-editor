import type { Command } from '..'
import { checkDynamicStages } from '../../../history/dynamicStages.ts'
import { i18n } from '../../../i18n'
import { showModal } from '../../../modals'
import ManageStagesModal from './manageStages/ManageStagesModal.vue'
import ManageStagesIcon from './ManageStagesIcon.vue'

export const manageStages: Command = {
    title: () => i18n.value.commands.manageStages.title,
    icon: {
        is: ManageStagesIcon,
    },

    async execute() {
        if (!(await checkDynamicStages())) return

        void showModal(ManageStagesModal, {})
    },
}
