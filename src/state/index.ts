import type { Chart } from '../chart'
import type { Bgm } from './bgm'
import type { Entity } from './entities'
import { createBpms, type BpmIntegral } from './integrals/bpms'
import type { Store } from './store'
import { createStore } from './store/creates'

export type State = {
    bgm: Bgm
    store: Store
    bpms: BpmIntegral[]
    groupCount: number

    selectedEntities: Entity[]
}

export const createState = (chart: Chart, offset: number): State => ({
    bgm: { offset },
    store: createStore(chart),
    bpms: createBpms(chart),
    groupCount: chart.groupCount,

    selectedEntities: [],
})
