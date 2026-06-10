import { type LevelDataEntity } from '@sonolus/core'
import type { BaseEventConnectionEntity } from '../../../../state/entities/events/connections'
import type { EventJointEntity } from '../../../../state/entities/events/joints'
import type { Range } from '../../../../utils/range'

export const serializeEventsToLevelDataEntities = <T extends EventJointEntity>(
    connectionEntities: Iterable<BaseEventConnectionEntity<T>>,
    range: Range<T> | undefined,
    getName: () => string,
    create: (joint: T) => LevelDataEntity,
) => {
    const entities = new Map<T, LevelDataEntity>()

    const getOrCreate = (joint: T) => {
        const entity = entities.get(joint)
        if (entity) return entity

        const newEntity = create(joint)
        entities.set(joint, newEntity)

        return newEntity
    }

    for (const entity of connectionEntities) {
        const min = getOrCreate(entity.min)
        const max = getOrCreate(entity.max)

        min.data.push({
            name: 'next',
            ref: (max.name ??= getName()),
        })
    }

    return {
        ref: range && (getOrCreate(range.min).name ??= getName()),
        entities: entities.values(),
    }
}

export const eventEases = {
    linear: 1,
    in: 2,
    out: 3,
    inOut: 4,
    outIn: 5,
    none: 0,
}
