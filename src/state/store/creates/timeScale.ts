import type { Store } from '..'
import type { Chart } from '../../../chart'
import { toTimeScaleEntity } from '../../entities/timeScale'
import { addToStoreGrid } from '../grid'

export const createStoreTimeScales = (store: Store, chart: Chart) => {
    for (const object of chart.timeScales) {
        const entity = toTimeScaleEntity(object)

        addToStoreGrid(store.grid, entity, entity.beat)
    }
}
