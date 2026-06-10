import { createStoreEventEntities } from '.'
import type { Store } from '../..'
import type { Chart } from '../../../../chart'
import { toCameraEventConnectionEntity } from '../../../entities/events/connections/camera'
import { toCameraEventJointEntity } from '../../../entities/events/joints/camera'

export const createStoreCameraEvents = (store: Store, chart: Chart) => {
    store.globalEventRanges.cameraEventJoint = createStoreEventEntities(
        store.grid,
        chart.cameraEvents,
        toCameraEventJointEntity,
        toCameraEventConnectionEntity,
    )
}
