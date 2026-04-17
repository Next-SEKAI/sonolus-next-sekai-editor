import type { Chart } from '../chart'
import type { Bgm } from './bgm'
import type { Entity } from './entities'
import type { Groups } from './groups'
import { createBpms, type BpmIntegral } from './integrals/bpms'
import type { Store } from './store'
import { createStore } from './store/creates'

export type State = {
    filename?: string

    bgm: Bgm
    initialLife: number
    store: Store
    bpms: BpmIntegral[]
    groups: Groups

    selectedEntities: Entity[]
}

export const createState = (chart: Chart, offset: number, filename?: string): State => ({
    filename,

    bgm: { offset },
    initialLife: chart.initialLife,
    store: createStore(chart),
    bpms: createBpms(chart),
    groups: chart.groups,

    selectedEntities: [],
})
