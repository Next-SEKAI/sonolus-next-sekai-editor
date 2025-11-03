import { Value } from '@sinclair/typebox/value'
import type { LevelData } from '@sonolus/core'
import { ungzip } from 'pako'
import { parseLevelData } from '../../levelData/parse'
import { autoSaveSchema } from './schema'

export const parseAutoSave = (data: unknown): LevelData => {
    Value.Assert(autoSaveSchema, data)

    if (!('version' in data)) return data

    // eslint-disable-next-line @typescript-eslint/no-misused-spread
    const buffer = Uint8Array.from([...atob(data.levelData)].map((c) => c.charCodeAt(0)))

    return parseLevelData(JSON.parse(new TextDecoder().decode(ungzip(buffer))))
}
