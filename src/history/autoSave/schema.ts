import { Type, type Static } from '@sinclair/typebox'
import { levelDataSchema } from '../../levelData/schema'

const v1Schema = Type.Object({
    version: Type.Literal(1),
    levelData: Type.String(),
})

export const autoSaveSchema = Type.Union([v1Schema, levelDataSchema])

export type AutoSave = Static<typeof v1Schema>
