import type { Command } from '..'
import { i18n } from '../../../i18n'
import { startOrStopPlayer } from '../../player'
import PlayIcon from './PlayIcon.vue'

export const play: Command = {
    title: () => i18n.value.commands.play.title,
    icon: {
        is: PlayIcon,
    },

    execute() {
        startOrStopPlayer()
    },
}
