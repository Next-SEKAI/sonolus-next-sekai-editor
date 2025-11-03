import type { LevelData } from '@sonolus/core'
import { gzip } from 'pako'
import type { AutoSave } from './schema'

export const serializeAutoSave = (levelData: LevelData, filename?: string): AutoSave => {
    const buffer = gzip(JSON.stringify(levelData), {
        level: 9,
    })

    return {
        version: 1,
        filename,
        levelData: btoa(String.fromCharCode(...buffer)),
    }
}
