import Type from 'typebox'
import { levelDataEntitiesSchema } from '../../levelData/entities/schema'

export const clipboardDataSchema = Type.Object({
    lane: Type.Number(),
    beat: Type.Number({ minimum: 0 }),
    entities: levelDataEntitiesSchema,
})

export type ClipboardData = Type.Static<typeof clipboardDataSchema>
