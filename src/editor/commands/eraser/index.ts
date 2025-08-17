import type { Command } from '..'
import { i18n } from '../../../i18n'
import { notify } from '../../notification'
import { switchToolTo } from '../../tools'
import EraserIcon from './EraserIcon.vue'

export const eraser: Command = {
    title: () => i18n.value.commands.eraser.title,
    icon: {
        is: EraserIcon,
    },

    execute() {
        switchToolTo('eraser')

        notify(() => i18n.value.commands.eraser.switched)
    },
}
