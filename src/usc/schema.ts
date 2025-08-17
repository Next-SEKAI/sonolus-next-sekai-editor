import { Type, type Static } from '@sinclair/typebox'
import { uscObjectSchema } from './objects/schema'

export const uscSchema = Type.Object({
    version: Type.Literal(2),
    usc: Type.Object({
        offset: Type.Number(),
        objects: Type.Array(uscObjectSchema),
    }),
})

export type Usc = Static<typeof uscSchema>
