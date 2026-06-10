import { createStoreStageEventEntities } from '.'
import type { Store } from '../../..'
import type { Chart } from '../../../../../chart'
import { toStagePivotEventConnectionEntity } from '../../../../entities/events/connections/stage/pivot'
import { toStagePivotEventJointEntity } from '../../../../entities/events/joints/stage/pivot'

export const createStoreStagePivotEvents = (store: Store, chart: Chart) => {
    createStoreStageEventEntities(
        store.grid,
        chart.stagePivotEvents,
        toStagePivotEventJointEntity,
        toStagePivotEventConnectionEntity,
        store.stageEventRanges.stagePivotEventJoint,
    )
}
