import { toEventConnectionEntity, type BaseEventConnectionEntity } from '.'
import type { CameraEventJointEntity } from '../joints/camera'

export type CameraEventConnectionEntity = BaseEventConnectionEntity<CameraEventJointEntity> & {
    type: 'cameraEventConnection'
}

export const toCameraEventConnectionEntity = (
    min: CameraEventJointEntity,
    max: CameraEventJointEntity,
): CameraEventConnectionEntity => ({
    type: 'cameraEventConnection',
    ...toEventConnectionEntity(min, max),
})
