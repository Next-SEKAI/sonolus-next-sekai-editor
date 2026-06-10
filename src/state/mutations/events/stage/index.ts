import { addEventJoint, removeEventJoint } from '..'
import type { StageId } from '../../../../chart/stages'
import type { EntityOfType } from '../../../entities'
import type { StageEventConnectionEntityType } from '../../../entities/events/connections/stage'
import type { StageEventJointEntityType } from '../../../entities/events/joints/stage'
import type { Store } from '../../../store'

export const addStageEventJoint = <
    T extends { stageId: StageId },
    U extends StageEventJointEntityType,
    V extends StageEventConnectionEntityType,
>(
    store: Store,
    object: T,
    jointType: U,
    toJointEntity: (object: T) => EntityOfType<U>,
    connectionType: V,
    toConnectionEntity: (min: EntityOfType<U>, max: EntityOfType<U>) => EntityOfType<V>,
) =>
    addEventJoint(
        store,
        object,
        toJointEntity,
        connectionType,
        (entity) => entity.min.stageId === object.stageId,
        toConnectionEntity,
        () => store.stageEventRanges[jointType].get(object.stageId),
        (range) => {
            if (range) {
                store.stageEventRanges[jointType].set(object.stageId, range)
            } else {
                store.stageEventRanges[jointType].delete(object.stageId)
            }
        },
    )

export const removeStageEventJoint = <
    T extends StageEventJointEntityType,
    U extends StageEventConnectionEntityType,
>(
    store: Store,
    joint: EntityOfType<T>,
    jointType: T,
    connectionType: U,
    toConnectionEntity: (min: EntityOfType<T>, max: EntityOfType<T>) => EntityOfType<U>,
) => {
    removeEventJoint(
        store,
        joint,
        connectionType,
        toConnectionEntity,
        () => store.stageEventRanges[jointType].get(joint.stageId),
        (range) => {
            if (range) {
                store.stageEventRanges[jointType].set(joint.stageId, range)
            } else {
                store.stageEventRanges[jointType].delete(joint.stageId)
            }
        },
    )
}
