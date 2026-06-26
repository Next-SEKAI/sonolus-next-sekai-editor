import type { LevelData } from '@sonolus/core'
import Type from 'typebox'
import { levelDataEntitiesSchema } from './entities/schema'

export const levelDataSchema = Type.Object({
    bgmOffset: Type.Number(),
    entities: levelDataEntitiesSchema,
})

type _LevelData = Type.Static<typeof levelDataSchema>
type _Test<T extends LevelData = _LevelData, U extends _LevelData = LevelData> = [T, U]
