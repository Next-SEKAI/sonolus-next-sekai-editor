import type { Chart } from '../chart'
import type { Groups } from '../chart/groups'
import type { Stages } from '../chart/stages'
import type { Bgm } from './bgm'
import type { Entity } from './entities'
import { createBpms, type BpmIntegral } from './integrals/bpms'
import type { Store } from './store'
import { createStore } from './store/creates'

export type State = {
    filename?: string

    bgm: Bgm
    initialLife: number
    isDynamicStages: boolean
    store: Store
    bpms: BpmIntegral[]
    groups: Groups
    stages: Stages

    selectedEntities: Entity[]
}

export const createState = (chart: Chart, offset: number, filename?: string): State => ({
    filename,

    bgm: { offset },
    initialLife: chart.initialLife,
    isDynamicStages: chart.isDynamicStages,
    store: createStore(chart),
    bpms: createBpms(chart),
    groups: chart.groups,
    stages: chart.stages,

    selectedEntities: [],
})
