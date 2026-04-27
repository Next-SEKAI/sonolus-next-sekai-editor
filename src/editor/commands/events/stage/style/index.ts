import type { Command } from '../../..'
import { checkDynamicStages } from '../../../../../history/dynamicStages'
import { i18n } from '../../../../../i18n'
import { showModal } from '../../../../../modals'
import { interpolate } from '../../../../../utils/interpolate'
import { notify } from '../../../../notification'
import { isSidebarVisible } from '../../../../sidebars'
import { switchToolTo, toolName } from '../../../../tools'
import EventIcon from '../../EventIcon.vue'
import DefaultStageStyleEventPropertiesModal from './DefaultStageStyleEventPropertiesModal.vue'

export const stageStyleEvent: Command = {
    title: interpolate(
        () => i18n.value.commands.events.title,
        () => i18n.value.events.stageStyleEvent,
    ),
    icon: {
        is: EventIcon,
        props: {
            fill: '#0ff',
        },
    },

    async execute() {
        if (!(await checkDynamicStages())) return

        if (toolName.value === 'stageStyleEvent') {
            if (!isSidebarVisible.value) {
                void showModal(DefaultStageStyleEventPropertiesModal, {})
            }
        } else {
            switchToolTo('stageStyleEvent')

            notify(
                interpolate(
                    () => i18n.value.commands.events.switched,
                    () => i18n.value.events.stageStyleEvent,
                ),
            )
        }
    },
}
