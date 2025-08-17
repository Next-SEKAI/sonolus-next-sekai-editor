import { Value } from '@sinclair/typebox/value'
import type { LevelData } from '@sonolus/core'
import { levelDataSchema } from './schema'

export const parseLevelData = (data: unknown): LevelData => {
    Value.Assert(levelDataSchema, data)
    return data
}
