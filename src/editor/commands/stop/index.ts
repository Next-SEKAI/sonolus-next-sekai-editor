import type { Command } from '..'
import { i18n } from '../../../i18n'
import { stopPlayer } from '../../player'
import StopIcon from './StopIcon.vue'

export const stop: Command = {
    title: () => i18n.value.commands.stop.title,
    icon: {
        is: StopIcon,
    },

    execute() {
        stopPlayer(true)
    },
}
