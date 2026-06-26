import type { BaseStageEventJointEntity } from '.'
import type {
    BorderStyle,
    JudgmentLineColor,
    StageStyleEventObject,
} from '../../../../../chart/events/stage/style'

export type StageStyleEventJointEntity = BaseStageEventJointEntity & {
    type: 'stageStyleEventJoint'
    editorLane: number
    judgmentLineColor: JudgmentLineColor
    leftBorderStyle: BorderStyle
    rightBorderStyle: BorderStyle
    stageAlpha: number
    laneAlpha: number
    judgmentLineAlpha: number
}

export const toStageStyleEventJointEntity = (
    object: StageStyleEventObject,
): StageStyleEventJointEntity => ({
    type: 'stageStyleEventJoint',
    hitbox: {
        lane: object.editorLane,
        beat: object.beat,
        w: 0.2,
        h: 0.2,
    },

    stageId: object.stageId,
    beat: object.beat,
    editorLane: object.editorLane,
    judgmentLineColor: object.judgmentLineColor,
    leftBorderStyle: object.leftBorderStyle,
    rightBorderStyle: object.rightBorderStyle,
    stageAlpha: object.stageAlpha,
    laneAlpha: object.laneAlpha,
    judgmentLineAlpha: object.judgmentLineAlpha,
    eventEase: object.eventEase,
})
