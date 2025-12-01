import type { Command } from '..'
import { i18n } from '../../../i18n'
import { showModal } from '../../../modals'
import { settings } from '../../../settings'
import { interpolate } from '../../../utils/interpolate'
import { notify } from '../../notification'
import { isSidebarVisible } from '../../sidebars'
import { switchToolTo, toolName } from '../../tools'
import { defaultNotePropertiesPresetIndex } from '../../tools/note'
import DefaultNotePropertiesModal from './DefaultNotePropertiesModal.vue'
import NoteIcon from './NoteIcon.vue'

export const note: Command = {
    title: () => i18n.value.commands.note.title.default,
    icon: {
        is: NoteIcon,
    },

    async execute() {
        if (toolName.value === 'note') {
            if (isSidebarVisible.value) {
                defaultNotePropertiesPresetIndex.value =
                    (defaultNotePropertiesPresetIndex.value + 1) %
                    settings.defaultNotePropertiesPresets.length
            } else {
                await showModal(DefaultNotePropertiesModal, {})
            }
        } else {
            switchToolTo('note')
        }

        notify(
            interpolate(
                () => i18n.value.commands.note.switched,
                `${defaultNotePropertiesPresetIndex.value + 1}`,
            ),
        )
    },
}

export const createNote = (index: number): Command => ({
    title: interpolate(() => i18n.value.commands.note.title.preset, `${index + 1}`),
    icon: {
        is: NoteIcon,
        props: {
            index,
        },
    },

    async execute() {
        if (toolName.value === 'note' && defaultNotePropertiesPresetIndex.value === index) {
            if (!isSidebarVisible.value) {
                await showModal(DefaultNotePropertiesModal, {})
            }
        } else {
            defaultNotePropertiesPresetIndex.value = index
            switchToolTo('note')
        }

        notify(
            interpolate(
                () => i18n.value.commands.note.switched,
                `${defaultNotePropertiesPresetIndex.value + 1}`,
            ),
        )
    },
})
