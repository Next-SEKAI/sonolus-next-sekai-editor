import { saveAs } from 'file-saver'
import { gzip } from 'pako'
import type { Command } from '..'
import { state } from '../../../history'
import { bgm } from '../../../history/bgm'
import { store } from '../../../history/store'
import { i18n } from '../../../i18n'
import { serializeToLevelData } from '../../../levelData/serialize'
import { showModal } from '../../../modals'
import LoadingModal from '../../../modals/LoadingModal.vue'
import { timeout } from '../../../utils/promise'
import { notify } from '../../notification'
import SaveIcon from './SaveIcon.vue'

export const save: Command = {
    title: () => i18n.value.commands.save.title,
    icon: {
        is: SaveIcon,
    },

    execute() {
        void showModal(LoadingModal, {
            title: () => i18n.value.commands.save.title,
            async *task() {
                yield () => i18n.value.commands.save.exporting
                await timeout(50)

                const levelData = serializeToLevelData(
                    bgm.value.offset,
                    store.value,
                    state.value.groupCount,
                )

                const file = gzip(JSON.stringify(levelData), {
                    level: 9,
                })
                const blob = new Blob([file], {
                    type: 'application/octet-stream',
                })
                saveAs(blob, 'LevelData')

                notify(() => i18n.value.commands.save.saved)
            },
        })
    },
}
