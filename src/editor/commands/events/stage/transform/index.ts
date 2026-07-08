import type { Command } from '../../..'
import { checkDynamicStages } from '../../../../../history/dynamicStages'
import { i18n } from '../../../../../i18n'
import { showModal } from '../../../../../modals'
import { interpolate } from '../../../../../utils/interpolate'
import { notify } from '../../../../notification'
import { isSidebarVisible } from '../../../../sidebars'
import { switchToolTo, toolName } from '../../../../tools'
import EventIcon from '../../EventIcon.vue'
import DefaultStageTransformEventPropertiesModal from './DefaultStageTransformEventPropertiesModal.vue'

export const stageTransformEvent: Command = {
    title: interpolate(
        () => i18n.value.commands.events.title,
        () => i18n.value.events.stageTransformEvent,
    ),
    icon: {
        is: EventIcon,
        props: {
            fill: '#ddd',
        },
    },

    async execute() {
        if (!(await checkDynamicStages())) return

        if (toolName.value === 'stageTransformEvent') {
            if (!isSidebarVisible.value) {
                void showModal(DefaultStageTransformEventPropertiesModal, {})
            }
        } else {
            switchToolTo('stageTransformEvent')

            notify(
                interpolate(
                    () => i18n.value.commands.events.switched,
                    () => i18n.value.events.stageTransformEvent,
                ),
            )
        }
    },
}
