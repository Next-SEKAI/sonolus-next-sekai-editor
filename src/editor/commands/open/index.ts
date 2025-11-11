import { ungzip } from 'pako'
import type { Command } from '..'
import { parseLevelDataChart } from '../../../chart/parse/levelData'
import { parseUscChart } from '../../../chart/parse/usc'
import { validateChart } from '../../../chart/validate'
import { checkState, resetState } from '../../../history'
import { i18n } from '../../../i18n'
import { parseLevelData } from '../../../levelData/parse'
import { showModal } from '../../../modals'
import LoadingModal from '../../../modals/LoadingModal.vue'
import { parseUsc } from '../../../usc/parse'
import { getFilename, pickFileForOpen } from '../../../utils/file'
import { timeout } from '../../../utils/promise'
import { notify } from '../../notification'
import OpenIcon from './OpenIcon.vue'

export const open: Command = {
    title: () => i18n.value.commands.open.title,
    icon: {
        is: OpenIcon,
    },

    async execute() {
        if (!(await checkState())) return

        const { file, handle } = await pickFileForOpen('levelData')
        if (!file) return

        await showModal(LoadingModal, {
            title: () => i18n.value.commands.open.title,
            async *task() {
                yield () => i18n.value.commands.open.loading

                const buffer = await file.arrayBuffer()

                yield () => i18n.value.commands.open.importing
                await timeout(50)

                const [type, data] = tryImport(buffer)
                switch (type) {
                    case 'levelData': {
                        const levelData = parseLevelData(data)

                        const chart = parseLevelDataChart(levelData.entities)
                        validateChart(chart)

                        resetState(chart, levelData.bgmOffset, getFilename(file), handle)
                        break
                    }
                    case 'usc': {
                        const { usc } = parseUsc(data)

                        const chart = parseUscChart(usc.objects)
                        validateChart(chart)

                        resetState(chart, usc.offset, getFilename(file))
                        break
                    }
                }

                notify(() => i18n.value.commands.open.opened)
            },
        })
    },
}

const tryImport = (buffer: ArrayBuffer) => {
    const levelData = tryImportLevelData(buffer)
    if (levelData) return ['levelData', levelData] as const

    const usc = tryImportUsc(buffer)
    if (usc) return ['usc', usc] as const

    throw new Error('Unsupported file format')
}

const tryImportLevelData = (buffer: ArrayBuffer): unknown => {
    try {
        return JSON.parse(new TextDecoder().decode(ungzip(buffer)))
    } catch {
        return
    }
}

const tryImportUsc = (buffer: ArrayBuffer): unknown => {
    try {
        return JSON.parse(new TextDecoder().decode(buffer))
    } catch {
        return
    }
}
