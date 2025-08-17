import type { Command } from '..'
import { pushState, state } from '../../../history'
import { bgm as currentBgm } from '../../../history/bgm'
import { i18n } from '../../../i18n'
import { showModal } from '../../../modals'
import { notify } from '../../notification'
import BgmIcon from './BgmIcon.vue'
import BgmModal from './BgmModal.vue'

export const bgm: Command = {
    title: () => i18n.value.commands.bgm.title,
    icon: {
        is: BgmIcon,
    },

    async execute() {
        const newBgm = await showModal(BgmModal, {
            bgm: currentBgm.value,
        })
        if (!newBgm) return

        pushState(() => i18n.value.commands.bgm.changed, {
            ...state.value,
            bgm: newBgm,
        })

        notify(() => i18n.value.commands.bgm.changed)
    },
}
