import { addStageEventJoint, removeStageEventJoint } from '.'
import type { AddMutation, RemoveMutation } from '../..'
import type { StageTransformEventObject } from '../../../../chart/events/stage/transform'
import { toStageTransformEventConnectionEntity } from '../../../entities/events/connections/stage/transform'
import {
    toStageTransformEventJointEntity,
    type StageTransformEventJointEntity,
} from '../../../entities/events/joints/stage/transform'

export const addStageTransformEventJoint: AddMutation<StageTransformEventObject> = (
    { store },
    object,
) =>
    addStageEventJoint(
        store,
        object,
        'stageTransformEventJoint',
        toStageTransformEventJointEntity,
        'stageTransformEventConnection',
        toStageTransformEventConnectionEntity,
    )

export const removeStageTransformEventJoint: RemoveMutation<StageTransformEventJointEntity> = (
    { store },
    entity,
) => {
    removeStageEventJoint(
        store,
        entity,
        'stageTransformEventJoint',
        'stageTransformEventConnection',
        toStageTransformEventConnectionEntity,
    )
}
