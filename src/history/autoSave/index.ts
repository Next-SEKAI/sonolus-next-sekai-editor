import { watch } from 'vue'
import { isStateDirty, resetState, state } from '..'
import { parseLevelDataChart } from '../../chart/parse/levelData'
import { validateChart } from '../../chart/validate'
import { i18n } from '../../i18n'
import { serializeToLevelData } from '../../levelData/serialize'
import { showModal } from '../../modals'
import LoadingModal from '../../modals/LoadingModal.vue'
import { settings } from '../../settings'
import { storageGet, storageRemove, storageSet } from '../../storage'
import { timeout } from '../../utils/promise'
import { parseAutoSave } from './parse'
import { serializeAutoSave } from './serialize'

export const useAutoSave = () => {
    let id: number | undefined

    watch(
        () => settings.autoSave && state.value,
        (state) => {
            clearTimeout(id)

            if (!state) {
                storageRemove('autoSave.levelData')
                return
            }

            if (!isStateDirty.value) return

            id = setTimeout(() => {
                storageSet(
                    'autoSave.levelData',
                    serializeAutoSave(
                        serializeToLevelData(state.bgm.offset, state.store, state.groupCount),
                    ),
                )
            }, settings.autoSaveDelay * 1000)
        },
    )

    const data = storageGet('autoSave.levelData')
    if (data) {
        void showModal(LoadingModal, {
            title: () => i18n.value.history.autoSave.title,
            async *task() {
                yield () => i18n.value.history.autoSave.importing
                await timeout(50)

                const levelData = parseAutoSave(data)

                const chart = parseLevelDataChart(levelData.entities)
                validateChart(chart)

                resetState(chart, levelData.bgmOffset)
            },
        })
    }
}
