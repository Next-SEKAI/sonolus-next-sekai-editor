import { createStoreStageEventEntities } from '.'
import type { Store } from '../../..'
import type { Chart } from '../../../../../chart'
import { toStageMaskEventConnectionEntity } from '../../../../entities/events/connections/stage/mask'
import { toStageMaskEventJointEntity } from '../../../../entities/events/joints/stage/mask'

export const createStoreStageMaskEvents = (store: Store, chart: Chart) => {
    createStoreStageEventEntities(
        store.grid,
        chart.stageMaskEvents,
        toStageMaskEventJointEntity,
        toStageMaskEventConnectionEntity,
        store.stageEventRanges.stageMaskEventJoint,
    )
}
