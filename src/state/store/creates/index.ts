import type { Store } from '..'
import type { Chart } from '../../../chart'
import { createStoreBpms } from './bpm'
import { createStoreCameraEvents } from './events/camera'
import { createStoreStageMaskEvents } from './events/stage/mask'
import { createStoreStagePivotEvents } from './events/stage/pivot'
import { createStoreStageStyleEvents } from './events/stage/style'
import { createStoreStageTransformEvents } from './events/stage/transform'
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

            stagePivotEventJoint: new Map(),
            stagePivotEventConnection: new Map(),

            stageStyleEventJoint: new Map(),
            stageStyleEventConnection: new Map(),

            stageTransformEventJoint: new Map(),
            stageTransformEventConnection: new Map(),

            note: new Map(),
            connector: new Map(),
        },
        globalEventRanges: {},
        stageEventRanges: {
            stageMaskEventJoint: new Map(),
            stagePivotEventJoint: new Map(),
            stageStyleEventJoint: new Map(),
            stageTransformEventJoint: new Map(),
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
    createStoreStagePivotEvents(store, chart)
    createStoreStageStyleEvents(store, chart)
    createStoreStageTransformEvents(store, chart)

    createStoreSlides(store, chart)

    return store
}
