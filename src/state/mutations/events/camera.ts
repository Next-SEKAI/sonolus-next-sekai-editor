import { addEventJoint, removeEventJoint } from '.'
import type { AddMutation, RemoveMutation } from '..'
import type { CameraEventObject } from '../../../chart/events/camera'
import { toCameraEventConnectionEntity } from '../../entities/events/connections/camera'
import {
    toCameraEventJointEntity,
    type CameraEventJointEntity,
} from '../../entities/events/joints/camera'

export const addCameraEventJoint: AddMutation<CameraEventObject> = ({ store }, object) =>
    addEventJoint(
        store,
        object,
        toCameraEventJointEntity,
        'cameraEventConnection',
        toCameraEventConnectionEntity,
        () => store.globalEventRanges.cameraEventJoint,
        (range) => (store.globalEventRanges.cameraEventJoint = range),
    )

export const removeCameraEventJoint: RemoveMutation<CameraEventJointEntity> = (
    { store },
    entity,
) => {
    removeEventJoint(
        store,
        entity,
        'cameraEventConnection',
        toCameraEventConnectionEntity,
        () => store.globalEventRanges.cameraEventJoint,
        (range) => (store.globalEventRanges.cameraEventJoint = range),
    )
}
