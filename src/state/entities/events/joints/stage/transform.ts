import type { BaseStageEventJointEntity } from '.'
import type { Anchor, StageTransformEventObject } from '../../../../../chart/events/stage/transform'

export type StageTransformEventJointEntity = BaseStageEventJointEntity & {
    type: 'stageTransformEventJoint'
    rotation: number
    xTranslation: number
    yTranslation: number
    anchor: Anchor
}

export const toStageTransformEventJointEntity = (
    object: StageTransformEventObject,
): StageTransformEventJointEntity => ({
    type: 'stageTransformEventJoint',
    hitbox: {
        lane: object.xTranslation,
        beat: object.beat,
        w: 0.2,
        h: 0.2,
    },

    stageId: object.stageId,
    beat: object.beat,
    rotation: object.rotation,
    xTranslation: object.xTranslation,
    yTranslation: object.yTranslation,
    anchor: object.anchor,
    eventEase: object.eventEase,
})
