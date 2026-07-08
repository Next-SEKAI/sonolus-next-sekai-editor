import { createStoreStageEventEntities } from '.'
import type { Store } from '../../..'
import type { Chart } from '../../../../../chart'
import { toStageTransformEventConnectionEntity } from '../../../../entities/events/connections/stage/transform'
import { toStageTransformEventJointEntity } from '../../../../entities/events/joints/stage/transform'

export const createStoreStageTransformEvents = (store: Store, chart: Chart) => {
    createStoreStageEventEntities(
        store.grid,
        chart.stageTransformEvents,
        toStageTransformEventJointEntity,
        toStageTransformEventConnectionEntity,
        store.stageEventRanges.stageTransformEventJoint,
    )
}
