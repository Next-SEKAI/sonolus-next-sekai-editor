import type { EntityOfType } from '../../../entities'
import type { EventConnectionEntityType } from '../../../entities/events/connections'
import type { EventJointEntityType } from '../../../entities/events/joints'
import { addToStoreGrid, type StoreGrid } from '../../grid'

export const createStoreEventEntities = <
    T extends { beat: number },
    U extends EventJointEntityType,
    V extends EventConnectionEntityType,
>(
    grid: StoreGrid,
    objects: T[],
    toJointEntity: (object: T) => EntityOfType<U>,
    toConnectionEntity: (min: EntityOfType<U>, max: EntityOfType<U>) => EntityOfType<V>,
) => {
    let min: EntityOfType<U> | undefined
    let max: EntityOfType<U> | undefined
    let prev: EntityOfType<U> | undefined

    for (const object of [...objects].sort((a, b) => a.beat - b.beat)) {
        const entity = toJointEntity(object)

        if (prev) addToStoreGrid(grid, toConnectionEntity(prev, entity), prev.beat, entity.beat)

        addToStoreGrid(grid, entity, entity.beat)

        min ??= entity
        max = entity
        prev = entity
    }

    if (min && max)
        return {
            min,
            max,
        }
}
