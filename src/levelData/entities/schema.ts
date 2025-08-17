import { Type, type Static } from '@sinclair/typebox'
import type { LevelDataEntity } from '@sonolus/core'

const levelDataEntitySchema = Type.Object({
    name: Type.Optional(Type.String()),
    archetype: Type.String(),
    data: Type.Array(
        Type.Union([
            Type.Object({
                name: Type.String(),
                value: Type.Number(),
            }),
            Type.Object({
                name: Type.String(),
                ref: Type.String(),
            }),
        ]),
    ),
})

type _LevelDataEntity = Static<typeof levelDataEntitySchema>
type _Test<
    T extends LevelDataEntity = _LevelDataEntity,
    U extends _LevelDataEntity = LevelDataEntity,
> = [T, U]

export const levelDataEntitiesSchema = Type.Array(levelDataEntitySchema)
