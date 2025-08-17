import { Type, type Static } from '@sinclair/typebox'
import type { LevelData } from '@sonolus/core'
import { levelDataEntitiesSchema } from './entities/schema'

export const levelDataSchema = Type.Object({
    bgmOffset: Type.Number(),
    entities: levelDataEntitiesSchema,
})

type _LevelData = Static<typeof levelDataSchema>
type _Test<T extends LevelData = _LevelData, U extends _LevelData = LevelData> = [T, U]
