import type { LevelData } from '@sonolus/core'
import Value from 'typebox/value'
import { levelDataSchema } from './schema'

export const parseLevelData = (data: unknown): LevelData => {
    Value.Assert(levelDataSchema, data)
    return data
}
