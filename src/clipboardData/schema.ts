import { Type, type Static } from '@sinclair/typebox'
import { levelDataEntitiesSchema } from '../levelData/entities/schema'

export const clipboardDataSchema = Type.Object({
    lane: Type.Number(),
    beat: Type.Number({ minimum: 0 }),
    entities: levelDataEntitiesSchema,
})

export type ClipboardData = Static<typeof clipboardDataSchema>
