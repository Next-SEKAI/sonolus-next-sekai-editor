import { addStageEventJoint, removeStageEventJoint } from '.'
import type { AddMutation, RemoveMutation } from '../..'
import type { StagePivotEventObject } from '../../../../chart/events/stage/pivot'
import { toStagePivotEventConnectionEntity } from '../../../entities/events/connections/stage/pivot'
import {
    toStagePivotEventJointEntity,
    type StagePivotEventJointEntity,
} from '../../../entities/events/joints/stage/pivot'

export const addStagePivotEventJoint: AddMutation<StagePivotEventObject> = ({ store }, object) =>
    addStageEventJoint(
        store,
        object,
        'stagePivotEventJoint',
        toStagePivotEventJointEntity,
        'stagePivotEventConnection',
        toStagePivotEventConnectionEntity,
    )

export const removeStagePivotEventJoint: RemoveMutation<StagePivotEventJointEntity> = (
    { store },
    entity,
) => {
    removeStageEventJoint(
        store,
        entity,
        'stagePivotEventJoint',
        'stagePivotEventConnection',
        toStagePivotEventConnectionEntity,
    )
}
