import type { Command } from '../..'
import { checkDynamicStages } from '../../../../history/dynamicStages'
import { i18n } from '../../../../i18n'
import { showModal } from '../../../../modals'
import { interpolate } from '../../../../utils/interpolate'
import { notify } from '../../../notification'
import { isSidebarVisible } from '../../../sidebars'
import { switchToolTo, toolName } from '../../../tools'
import EventIcon from '../EventIcon.vue'
import DefaultCameraEventPropertiesModal from './DefaultCameraEventPropertiesModal.vue'

export const cameraEvent: Command = {
    title: interpolate(
        () => i18n.value.commands.events.title,
        () => i18n.value.events.cameraEvent,
    ),
    icon: {
        is: EventIcon,
        props: {
            fill: '#f00',
        },
    },

    async execute() {
        if (!(await checkDynamicStages())) return

        if (toolName.value === 'cameraEvent') {
            if (!isSidebarVisible.value) {
                void showModal(DefaultCameraEventPropertiesModal, {})
            }
        } else {
            switchToolTo('cameraEvent')

            notify(
                interpolate(
                    () => i18n.value.commands.events.switched,
                    () => i18n.value.events.cameraEvent,
                ),
            )
        }
    },
}
