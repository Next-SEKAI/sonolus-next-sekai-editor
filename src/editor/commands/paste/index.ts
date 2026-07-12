import type { Command } from '..'
import { updateClipboard } from '../../../clipboard/index.ts'
import { i18n } from '../../../i18n'
import { notify } from '../../notification'
import { switchToolTo } from '../../tools'
import PasteIcon from './PasteIcon.vue'

export const paste: Command = {
    title: () => i18n.value.commands.paste.title,
    icon: {
        is: PasteIcon,
    },

    execute() {
        void updateClipboard()

        switchToolTo('paste')

        notify(() => i18n.value.commands.paste.switched)
    },
}
