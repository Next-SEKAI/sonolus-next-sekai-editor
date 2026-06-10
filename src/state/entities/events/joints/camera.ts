import type { BaseEventJointEntity } from '.'
import type { CameraEventObject, CameraZoomVerticalAlign } from '../../../../chart/events/camera'

export type CameraEventJointEntity = BaseEventJointEntity & {
    type: 'cameraEventJoint'
    cameraLeft: number
    cameraSize: number
    cameraZoom: number
    cameraZoomTargetLane: number
    cameraZoomTargetY: number
    cameraZoomVerticalAlign: CameraZoomVerticalAlign
    cameraRotation: number
    cameraStageTilt: number
}

export const toCameraEventJointEntity = (object: CameraEventObject): CameraEventJointEntity => ({
    type: 'cameraEventJoint',
    hitbox: {
        lane: object.cameraLeft + object.cameraSize / 2,
        beat: object.beat,
        w: object.cameraSize / 2 + 0.2,
        h: 0.2,
    },

    beat: object.beat,
    cameraLeft: object.cameraLeft,
    cameraSize: object.cameraSize,
    cameraZoom: object.cameraZoom,
    cameraZoomTargetLane: object.cameraZoomTargetLane,
    cameraZoomTargetY: object.cameraZoomTargetY,
    cameraZoomVerticalAlign: object.cameraZoomVerticalAlign,
    cameraRotation: object.cameraRotation,
    cameraStageTilt: object.cameraStageTilt,
    eventEase: object.eventEase,
})
