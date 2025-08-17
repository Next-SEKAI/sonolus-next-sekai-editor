import type { Command } from '..'
import { i18n } from '../../../i18n'
import { changePlayerSpeed } from '../../player'
import SpeedDownIcon from './SpeedDownIcon.vue'

export const speedDown: Command = {
    title: () => i18n.value.commands.speeds.speedDown.title,
    icon: {
        is: SpeedDownIcon,
    },

    execute() {
        changePlayerSpeed(-1)
    },
}
