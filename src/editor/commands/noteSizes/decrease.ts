import type { Command } from '..'
import { i18n } from '../../../i18n'
import { interpolate } from '../../../utils/interpolate.ts'
import { notify } from '../../notification.ts'
import { view } from '../../view.ts'
import NoteSizeIcon from './NoteSizeIcon.vue'

export const decreaseNoteSize: Command = {
    title: () => i18n.value.commands.noteSizes.decrease.title,
    icon: {
        is: NoteSizeIcon,
    },

    execute() {
        view.noteSize = Math.max(0, view.noteSize - 1)

        notify(interpolate(() => i18n.value.commands.noteSizes.changed, `${view.noteSize}`))
    },
}
