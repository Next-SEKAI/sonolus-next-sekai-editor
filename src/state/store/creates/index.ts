import type { Store } from '..'
import type { Chart } from '../../../chart'
import { createStoreBpms } from './bpm'
import { createStoreSlides } from './slide'
import { createStoreTimeScales } from './timeScale'

export const createStore = (chart: Chart) => {
    const store: Store = {
        grid: {
            bpm: new Map(),
            timeScale: new Map(),

            note: new Map(),
            connector: new Map(),
        },
        slides: {
            note: new Map(),
            connector: new Map(),
            info: new Map(),
        },
    }

    createStoreBpms(store, chart)
    createStoreTimeScales(store, chart)

    createStoreSlides(store, chart)

    return store
}
