import type { Command } from '../../..'
import { checkDynamicStages } from '../../../../../history/dynamicStages'
import { i18n } from '../../../../../i18n'
import { showModal } from '../../../../../modals'
import { interpolate } from '../../../../../utils/interpolate'
import { notify } from '../../../../notification'
import { isSidebarVisible } from '../../../../sidebars'
import { switchToolTo, toolName } from '../../../../tools'
import EventIcon from '../../EventIcon.vue'
import DefaultStageMaskEventPropertiesModal from './DefaultStageMaskEventPropertiesModal.vue'

export const stageMaskEvent: Command = {
    title: interpolate(
        () => i18n.value.commands.events.title,
        () => i18n.value.events.stageMaskEvent,
    ),
    icon: {
        is: EventIcon,
        props: {
            fill: '#0f0',
        },
    },

    async execute() {
        if (!(await checkDynamicStages())) return

        if (toolName.value === 'stageMaskEvent') {
            if (!isSidebarVisible.value) {
                void showModal(DefaultStageMaskEventPropertiesModal, {})
            }
        } else {
            switchToolTo('stageMaskEvent')

            notify(
                interpolate(
                    () => i18n.value.commands.events.switched,
                    () => i18n.value.events.stageMaskEvent,
                ),
            )
        }
    },
}
