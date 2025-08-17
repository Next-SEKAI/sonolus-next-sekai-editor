import type { Command } from '..'
import { i18n } from '../../../i18n'
import { settings } from '../../../settings'
import { notify } from '../../notification'
import ZoomXInIcon from './ZoomXInIcon.vue'

export const zoomXIn: Command = {
    title: () => i18n.value.commands.zooms.zoomXIn.title,
    icon: {
        is: ZoomXInIcon,
    },

    execute() {
        settings.width /= 1.1

        notify(() => i18n.value.commands.zooms.zoomXIn.zoomed)
    },
}
