import type { BaseStageEventJointEntity } from '.'
import type { DivisionParity, StagePivotEventObject } from '../../../../../chart/events/stage/pivot'

export type StagePivotEventJointEntity = BaseStageEventJointEntity & {
    type: 'stagePivotEventJoint'
    pivotLane: number
    divisionSize: number
    divisionParity: DivisionParity
    yOffset: number
    yOffsetBeat: number
}

export const toStagePivotEventJointEntity = (
    object: StagePivotEventObject,
): StagePivotEventJointEntity => ({
    type: 'stagePivotEventJoint',
    hitbox: {
        lane: object.pivotLane,
        beat: object.beat,
        w: 0.2,
        h: 0.2,
    },

    stageId: object.stageId,
    beat: object.beat,
    pivotLane: object.pivotLane,
    divisionSize: object.divisionSize,
    divisionParity: object.divisionParity,
    yOffset: object.yOffset,
    yOffsetBeat: object.yOffsetBeat,
    eventEase: object.eventEase,
})
