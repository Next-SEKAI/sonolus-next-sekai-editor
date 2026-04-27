import { createStoreStageEventEntities } from '.'
import type { Store } from '../../..'
import type { Chart } from '../../../../../chart'
import { toStageStyleEventConnectionEntity } from '../../../../entities/events/connections/stage/style'
import { toStageStyleEventJointEntity } from '../../../../entities/events/joints/stage/style'

export const createStoreStageStyleEvents = (store: Store, chart: Chart) => {
    createStoreStageEventEntities(
        store.grid,
        chart.stageStyleEvents,
        toStageStyleEventJointEntity,
        toStageStyleEventConnectionEntity,
        store.stageEventRanges.stageStyleEventJoint,
    )
}
