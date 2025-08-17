import type { Store } from '..'
import type { Chart } from '../../../chart'
import { toBpmEntity } from '../../entities/bpm'
import { addToStoreGrid } from '../grid'

export const createStoreBpms = (store: Store, chart: Chart) => {
    for (const object of chart.bpms) {
        const entity = toBpmEntity(object)

        addToStoreGrid(store.grid, entity, entity.beat)
    }
}
