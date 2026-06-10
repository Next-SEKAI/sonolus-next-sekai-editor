import type { BaseStageEventJointEntity } from '.'
import type { StageMaskEventObject } from '../../../../../chart/events/stage/mask'

export type StageMaskEventJointEntity = BaseStageEventJointEntity & {
    type: 'stageMaskEventJoint'
    maskLeft: number
    maskSize: number
}

export const toStageMaskEventJointEntity = (
    object: StageMaskEventObject,
): StageMaskEventJointEntity => ({
    type: 'stageMaskEventJoint',
    hitbox: {
        lane: object.maskLeft + object.maskSize / 2,
        beat: object.beat,
        w: object.maskSize / 2 + 0.2,
        h: 0.2,
    },

    stageId: object.stageId,
    beat: object.beat,
    maskLeft: object.maskLeft,
    maskSize: object.maskSize,
    eventEase: object.eventEase,
})
