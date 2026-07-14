import { watch } from 'vue'
import { isDirty, resetState, state } from '..'
import { parseLevelDataChart } from '../../chart/parse/levelData'
import { validateChart } from '../../chart/validate'
import { i18n } from '../../i18n'
import { serializeToLevelData } from '../../levelData/serialize'
import { showModal } from '../../modals'
import InfoModal from '../../modals/InfoModal.vue'
import LoadingModal from '../../modals/LoadingModal.vue'
import { settings } from '../../settings'
import { storageGet, storageRemove, storageSet } from '../../storage'
import { timeout } from '../../utils/promise'
import { filename } from '../filename'
import { parseAutoSave } from './parse'
import { serializeAutoSave } from './serialize'

let enabled = true

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

            if (!isDirty.value) return

            id = setTimeout(() => {
                if (!enabled) return

                const levelData = serializeToLevelData(
                    state.initialLife,
                    state.isDynamicStages,
                    state.bgm.offset,
                    state.store,
                    state.groups,
                    state.stages,
                )
                if (levelData.entities.length > 10000) {
                    enabled = false

                    void showModal(InfoModal, {
                        title: () => i18n.value.history.autoSave.title,
                        message: () => i18n.value.history.autoSave.disabled,
                    })
                    return
                }

                storageSet('autoSave.levelData', serializeAutoSave(levelData, filename.value))
            }, settings.autoSaveDelay * 1000)
        },
    )

    const data = storageGet('autoSave.levelData', undefined)
    if (data) {
        void showModal(LoadingModal, {
            title: () => i18n.value.history.autoSave.title,
            async *task() {
                yield () => i18n.value.history.autoSave.importing
                await timeout(50)

                const { filename, levelData } = parseAutoSave(data)

                const chart = parseLevelDataChart(levelData.entities)
                validateChart(chart)

                resetState(true, chart, levelData.bgmOffset, filename)
            },
        })
    }
}

export const resetAutoSave = () => {
    enabled = true
}
