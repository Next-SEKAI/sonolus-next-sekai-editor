import type { Command } from '..'
import { i18n } from '../../../i18n'
import { changePlayerSpeed } from '../../player'
import SpeedUpIcon from './SpeedUpIcon.vue'

export const speedUp: Command = {
    title: () => i18n.value.commands.speeds.speedUp.title,
    icon: {
        is: SpeedUpIcon,
    },

    execute() {
        changePlayerSpeed(1)
    },
}
