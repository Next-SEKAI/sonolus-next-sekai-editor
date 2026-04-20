import type { AddMutation, RemoveMutation } from '.'
import type { TimeScaleObject } from '../../chart/timeScale'
import { toTimeScaleEntity, type TimeScaleEntity } from '../entities/timeScale'
import { addToStoreGrid, removeFromStoreGrid } from '../store/grid'

export const addTimeScale: AddMutation<TimeScaleObject> = ({ store, addToGroup }, object) => {
    const entity = toTimeScaleEntity(object)
    addToStoreGrid(store.grid, entity, entity.beat)
    addToGroup(object.groupId)

    return [entity]
}

export const removeTimeScale: RemoveMutation<TimeScaleEntity> = ({ store }, entity) => {
    removeFromStoreGrid(store.grid, entity, entity.beat)
}
