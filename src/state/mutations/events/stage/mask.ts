import { addStageEventJoint, removeStageEventJoint } from '.'
import type { AddMutation, RemoveMutation } from '../..'
import type { StageMaskEventObject } from '../../../../chart/events/stage/mask'
import { toStageMaskEventConnectionEntity } from '../../../entities/events/connections/stage/mask'
import {
    toStageMaskEventJointEntity,
    type StageMaskEventJointEntity,
} from '../../../entities/events/joints/stage/mask'

export const addStageMaskEventJoint: AddMutation<StageMaskEventObject> = ({ store }, object) =>
    addStageEventJoint(
        store,
        object,
        'stageMaskEventJoint',
        toStageMaskEventJointEntity,
        'stageMaskEventConnection',
        toStageMaskEventConnectionEntity,
    )

export const removeStageMaskEventJoint: RemoveMutation<StageMaskEventJointEntity> = (
    { store },
    entity,
) => {
    removeStageEventJoint(
        store,
        entity,
        'stageMaskEventJoint',
        'stageMaskEventConnection',
        toStageMaskEventConnectionEntity,
    )
}
