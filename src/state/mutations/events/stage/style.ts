import { addStageEventJoint, removeStageEventJoint } from '.'
import type { AddMutation, RemoveMutation } from '../..'
import type { StageStyleEventObject } from '../../../../chart/events/stage/style'
import { toStageStyleEventConnectionEntity } from '../../../entities/events/connections/stage/style'
import {
    toStageStyleEventJointEntity,
    type StageStyleEventJointEntity,
} from '../../../entities/events/joints/stage/style'

export const addStageStyleEventJoint: AddMutation<StageStyleEventObject> = ({ store }, object) =>
    addStageEventJoint(
        store,
        object,
        'stageStyleEventJoint',
        toStageStyleEventJointEntity,
        'stageStyleEventConnection',
        toStageStyleEventConnectionEntity,
    )

export const removeStageStyleEventJoint: RemoveMutation<StageStyleEventJointEntity> = (
    { store },
    entity,
) => {
    removeStageEventJoint(
        store,
        entity,
        'stageStyleEventJoint',
        'stageStyleEventConnection',
        toStageStyleEventConnectionEntity,
    )
}
