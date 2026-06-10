import { type LevelDataEntity } from '@sonolus/core'
import { getOptionalRef } from '..'

export const getEventRefs = (entities: LevelDataEntity[], archetype: string) => {
    const refs = new Map<string, LevelDataEntity>()

    for (const entity of entities) {
        if (entity.archetype !== archetype) continue
        if (!entity.name) continue

        refs.set(entity.name, entity)
    }

    return refs
}

export const parseEvents = <T>(
    refs: Map<string, LevelDataEntity>,
    firstRef: string,
    objects: T[],
    getObject: (entity: LevelDataEntity) => NoInfer<T>,
) => {
    let ref: string | undefined = firstRef
    while (ref) {
        const entity = refs.get(ref)
        if (!entity) throw new Error(`Invalid level: ref "${ref}" not found`)

        objects.push(getObject(entity))

        ref = getOptionalRef(entity, 'next')
    }
}
