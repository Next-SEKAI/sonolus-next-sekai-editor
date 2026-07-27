import type { Command } from '..'
import { i18n } from '../../../i18n'
import { notify } from '../../notification'
import { switchToolTo } from '../../tools'
import GenerateSlideNotesIcon from './GenerateSlideNotesIcon.vue'

export const generateSlideNotes: Command = {
    title: () => i18n.value.commands.generateSlideNotes.title,
    icon: {
        is: GenerateSlideNotesIcon,
    },

    execute() {
        switchToolTo('generateSlideNotes')

        notify(() => i18n.value.commands.generateSlideNotes.switched)
    },
}
