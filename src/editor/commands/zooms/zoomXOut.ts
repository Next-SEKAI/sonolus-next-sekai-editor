import type { Command } from '..'
import { i18n } from '../../../i18n'
import { settings } from '../../../settings'
import { notify } from '../../notification'
import ZoomXOutIcon from './ZoomXOutIcon.vue'

export const zoomXOut: Command = {
    title: () => i18n.value.commands.zooms.zoomXOut.title,
    icon: {
        is: ZoomXOutIcon,
    },

    execute() {
        settings.width *= 1.1

        notify(() => i18n.value.commands.zooms.zoomXOut.zoomed)
    },
}
