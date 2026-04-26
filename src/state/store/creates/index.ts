import type { Store } from '..'
import type { Chart } from '../../../chart'
import { createStoreBpms } from './bpm'
import { createStoreCameraEvents } from './events/camera'
import { createStoreStageMaskEvents } from './events/stage/mask'
import { createStoreSlides } from './slide'
import { createStoreTimeScales } from './timeScale'

export const createStore = (chart: Chart) => {
    const store: Store = {
        grid: {
            bpm: new Map(),
            timeScale: new Map(),

            cameraEventJoint: new Map(),
            cameraEventConnection: new Map(),

            stageMaskEventJoint: new Map(),
            stageMaskEventConnection: new Map(),

            note: new Map(),
            connector: new Map(),
        },
        globalEventRanges: {},
        stageEventRanges: {
            stageMaskEventJoint: new Map(),
        },
        slides: {
            note: new Map(),
            connector: new Map(),
            info: new Map(),
        },
    }

    createStoreBpms(store, chart)
    createStoreTimeScales(store, chart)

    createStoreCameraEvents(store, chart)

    createStoreStageMaskEvents(store, chart)

    createStoreSlides(store, chart)

    return store
}
