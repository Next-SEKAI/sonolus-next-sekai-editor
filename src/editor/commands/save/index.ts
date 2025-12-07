import { saveAs } from 'file-saver'
import { gzip } from 'pako'
import type { Command } from '..'
import { levelDataHandle, setLevelDataHandle, state } from '../../../history'
import { bgm } from '../../../history/bgm'
import { filename } from '../../../history/filename'
import { store } from '../../../history/store'
import { i18n } from '../../../i18n'
import { serializeToLevelData } from '../../../levelData/serialize'
import { showModal } from '../../../modals'
import LoadingModal from '../../../modals/LoadingModal.vue'
import { pickFileForSave } from '../../../utils/file'
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

                const name = filename.value ?? 'LevelData'

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

                const handle = levelDataHandle ?? (await pickFileForSave('levelData', name))
                if (handle) {
                    try {
                        const writable = await handle.createWritable()
                        await writable.write(blob)
                        await writable.close()

                        setLevelDataHandle(handle)
                    } catch {
                        saveAs(blob, name)

                        setLevelDataHandle(undefined)
                    }
                } else {
                    saveAs(blob, name)
                }

                notify(() => i18n.value.commands.save.saved)
            },
        })
    },
}
