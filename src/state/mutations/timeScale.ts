import type { TimeScaleObject } from '../../chart'
import { toTimeScaleEntity, type TimeScaleEntity } from '../entities/timeScale'
import { addToStoreGrid, removeFromStoreGrid } from '../store/grid'
import type { Transaction } from '../transaction'

export const addTimeScale = ({ store, addToGroup }: Transaction, object: TimeScaleObject) => {
    const entity = toTimeScaleEntity(object)
    addToStoreGrid(store.grid, entity, entity.beat)
    addToGroup(object.group)

    return [entity]
}

export const removeTimeScale = ({ store }: Transaction, entity: TimeScaleEntity) => {
    removeFromStoreGrid(store.grid, entity, entity.beat)
}
