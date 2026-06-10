import type { Command } from '../../..'
import { checkDynamicStages } from '../../../../../history/dynamicStages'
import { i18n } from '../../../../../i18n'
import { showModal } from '../../../../../modals'
import { interpolate } from '../../../../../utils/interpolate'
import { notify } from '../../../../notification'
import { isSidebarVisible } from '../../../../sidebars'
import { switchToolTo, toolName } from '../../../../tools'
import EventIcon from '../../EventIcon.vue'
import DefaultStagePivotEventPropertiesModal from './DefaultStagePivotEventPropertiesModal.vue'

export const stagePivotEvent: Command = {
    title: interpolate(
        () => i18n.value.commands.events.title,
        () => i18n.value.events.stagePivotEvent,
    ),
    icon: {
        is: EventIcon,
        props: {
            fill: '#00f',
        },
    },

    async execute() {
        if (!(await checkDynamicStages())) return

        if (toolName.value === 'stagePivotEvent') {
            if (!isSidebarVisible.value) {
                void showModal(DefaultStagePivotEventPropertiesModal, {})
            }
        } else {
            switchToolTo('stagePivotEvent')

            notify(
                interpolate(
                    () => i18n.value.commands.events.switched,
                    () => i18n.value.events.stagePivotEvent,
                ),
            )
        }
    },
}
