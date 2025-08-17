import type { BpmObject } from '../../chart'
import { addToOrdered, removeFromOrdered } from '../../utils/ordered'
import { toBpmEntity, type BpmEntity } from '../entities/bpm'
import { toBpmIntegral } from '../integrals/bpms'
import { addToStoreGrid, removeFromStoreGrid } from '../store/grid'
import type { Transaction } from '../transaction'

export const addBpm = ({ store, bpms }: Transaction, object: BpmObject) => {
    addToOrdered(bpms, 'x', toBpmIntegral(object))

    const entity = toBpmEntity(object)
    addToStoreGrid(store.grid, entity, entity.beat)

    return [entity]
}

export const removeBpm = ({ store, bpms }: Transaction, entity: BpmEntity) => {
    removeFromOrdered(bpms, 'x', entity.beat)

    removeFromStoreGrid(store.grid, entity, entity.beat)
}
