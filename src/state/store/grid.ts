import type { EntityOfType, EntityType } from '../entities'

export type StoreGrid = {
    [T in EntityType]: Map<number, Set<EntityOfType<T>>>
}

export const beatToKey = (beat: number) => Math.floor(beat)

export const getInStoreGrid = <T extends EntityType>(grid: StoreGrid, type: T, beat: number) => {
    const entities = grid[type].get(Math.floor(beat))
    if (!entities) return

    return [...entities]
}

export const addToStoreGrid = <T extends EntityType>(
    grid: StoreGrid,
    entity: EntityOfType<T>,
    fromBeat: number,
    toBeat = fromBeat,
) => {
    for (let key = Math.floor(fromBeat); key <= Math.floor(toBeat); key++) {
        grid[entity.type].set(key, new Set(grid[entity.type].get(key)).add(entity))
    }
}

export const removeFromStoreGrid = <T extends EntityType>(
    grid: StoreGrid,
    entity: EntityOfType<T>,
    fromBeat: number,
    toBeat = fromBeat,
) => {
    for (let key = Math.floor(fromBeat); key <= Math.floor(toBeat); key++) {
        const entities = grid[entity.type].get(key)
        if (!entities) continue

        if (!entities.has(entity)) return

        if (entities.size === 1) {
            grid[entity.type].delete(key)
        } else {
            const newEntities = new Set(entities)
            newEntities.delete(entity)

            grid[entity.type].set(key, newEntities)
        }
    }
}
