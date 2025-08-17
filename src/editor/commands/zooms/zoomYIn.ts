import type { Command } from '..'
import { i18n } from '../../../i18n'
import { settings } from '../../../settings'
import { notify } from '../../notification'
import ZoomYInIcon from './ZoomYInIcon.vue'

export const zoomYIn: Command = {
    title: () => i18n.value.commands.zooms.zoomYIn.title,
    icon: {
        is: ZoomYInIcon,
    },

    execute() {
        settings.pps *= 1.1

        notify(() => i18n.value.commands.zooms.zoomYIn.zoomed)
    },
}
