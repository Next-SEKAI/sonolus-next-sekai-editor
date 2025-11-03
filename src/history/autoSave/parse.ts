import { Value } from '@sinclair/typebox/value'
import type { LevelData } from '@sonolus/core'
import { ungzip } from 'pako'
import { parseLevelData } from '../../levelData/parse'
import { autoSaveSchema } from './schema'

type ParsedAutoSave = {
    filename?: string
    levelData: LevelData
}

export const parseAutoSave = (data: unknown): ParsedAutoSave => {
    Value.Assert(autoSaveSchema, data)

    if (!('version' in data))
        return {
            levelData: data,
        }

    // eslint-disable-next-line @typescript-eslint/no-misused-spread
    const buffer = Uint8Array.from([...atob(data.levelData)].map((c) => c.charCodeAt(0)))

    return {
        filename: data.filename,
        levelData: parseLevelData(JSON.parse(new TextDecoder().decode(ungzip(buffer)))),
    }
}
