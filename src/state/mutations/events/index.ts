import type { Range } from '../../../utils/range'
import type { EntityOfType } from '../../entities'
import type { EventConnectionEntityType } from '../../entities/events/connections'
import type { EventJointEntityType } from '../../entities/events/joints'
import type { Store } from '../../store'
import { addToStoreGrid, getInStoreGrid, removeFromStoreGrid } from '../../store/grid'

export const addEventJoint = <
    T,
    U extends EventJointEntityType,
    V extends EventConnectionEntityType,
>(
    store: Store,
    object: T,
    toJointEntity: (object: T) => EntityOfType<U>,
    connectionType: V,
    matchConnection: ((entity: EntityOfType<V>) => boolean) | undefined,
    toConnectionEntity: (min: EntityOfType<U>, max: EntityOfType<U>) => EntityOfType<V>,
    getRange: () => Range<EntityOfType<U>> | undefined,
    setRange: (range: Range<EntityOfType<U>> | undefined) => void,
) => {
    const joint = toJointEntity(object)
    addToStoreGrid(store.grid, joint, joint.beat)

    const connection = getInStoreGrid(store.grid, connectionType, joint.beat)?.find(
        (entity) =>
            entity.min.beat <= joint.beat &&
            entity.max.beat > joint.beat &&
            (matchConnection?.(entity) ?? true),
    )
    if (connection) {
        removeFromStoreGrid(store.grid, connection, connection.min.beat, connection.max.beat)
        addToStoreGrid(
            store.grid,
            toConnectionEntity(connection.min as never, joint),
            connection.min.beat,
            joint.beat,
        )
        addToStoreGrid(
            store.grid,
            toConnectionEntity(joint, connection.max as never),
            joint.beat,
            connection.max.beat,
        )
    } else {
        const range = getRange()
        if (range) {
            if (joint.beat < range.min.beat) {
                addToStoreGrid(
                    store.grid,
                    toConnectionEntity(joint, range.min),
                    joint.beat,
                    range.min.beat,
                )
                setRange({
                    min: joint,
                    max: range.max,
                })
            } else {
                addToStoreGrid(
                    store.grid,
                    toConnectionEntity(range.max, joint),
                    range.max.beat,
                    joint.beat,
                )
                setRange({
                    min: range.min,
                    max: joint,
                })
            }
        } else {
            setRange({
                min: joint,
                max: joint,
            })
        }
    }

    return [joint]
}

export const removeEventJoint = <
    T extends EventJointEntityType,
    U extends EventConnectionEntityType,
>(
    store: Store,
    joint: EntityOfType<T>,
    connectionType: U,
    toConnectionEntity: (min: EntityOfType<T>, max: EntityOfType<T>) => EntityOfType<U>,
    getRange: () => Range<EntityOfType<T>> | undefined,
    setRange: (range: Range<EntityOfType<T>> | undefined) => void,
) => {
    removeFromStoreGrid(store.grid, joint, joint.beat)

    const entities = getInStoreGrid(store.grid, connectionType, joint.beat)
    const prev = entities?.find((entity) => entity.max === joint)
    const next = entities?.find((entity) => entity.min === joint)

    const range = getRange()
    if (!range) throw new Error('Unexpected event range not found')

    if (!prev && !next) setRange(undefined)

    if (prev) {
        removeFromStoreGrid(store.grid, prev, prev.min.beat, prev.max.beat)
        if (range.max === joint)
            setRange({
                min: range.min,
                max: prev.min as never,
            })
    }

    if (next) {
        removeFromStoreGrid(store.grid, next, next.min.beat, next.max.beat)
        if (range.min === joint)
            setRange({
                min: next.max as never,
                max: range.max,
            })
    }

    if (prev && next)
        addToStoreGrid(
            store.grid,
            toConnectionEntity(prev.min as never, next.max as never),
            prev.min.beat,
            next.max.beat,
        )
}
