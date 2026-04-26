import { createStoreEventEntities } from '..'
import type { StageId } from '../../../../../chart/stages'
import type { Range } from '../../../../../utils/range'
import type { EntityOfType } from '../../../../entities'
import type { EventConnectionEntityType } from '../../../../entities/events/connections'
import type { EventJointEntityType } from '../../../../entities/events/joints'
import type { StoreGrid } from '../../../grid'

export const createStoreStageEventEntities = <
    T extends { stageId: StageId; beat: number },
    U extends EventJointEntityType,
    V extends EventConnectionEntityType,
>(
    grid: StoreGrid,
    objects: T[],
    toJointEntity: (object: T) => EntityOfType<U>,
    toConnectionEntity: (min: EntityOfType<U>, max: EntityOfType<U>) => EntityOfType<V>,
    ranges: Map<StageId, Range<EntityOfType<U>>>,
) => {
    const stageObjects = new Map<StageId, T[]>()
    for (const object of objects) {
        const objects = stageObjects.get(object.stageId)
        if (objects) {
            objects.push(object)
        } else {
            stageObjects.set(object.stageId, [object])
        }
    }

    for (const [id, objects] of stageObjects) {
        const range = createStoreEventEntities(grid, objects, toJointEntity, toConnectionEntity)
        if (!range) continue

        ranges.set(id, range)
    }
}
