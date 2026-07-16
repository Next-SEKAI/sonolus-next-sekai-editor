import type { BaseStageEventJointEntity } from '.'
import type {
    BorderStyle,
    JudgmentLineColor,
    JudgmentLineStyle,
    StageStyleEventObject,
} from '../../../../../chart/events/stage/style'

export type StageStyleEventJointEntity = BaseStageEventJointEntity & {
    type: 'stageStyleEventJoint'
    editorLane: number
    judgmentLineColor: JudgmentLineColor
    judgmentLineStyle: JudgmentLineStyle
    leftBorderStyle: BorderStyle
    rightBorderStyle: BorderStyle
    isFullWidth: boolean
    stageAlpha: number
    noteAlpha: number
    laneAlpha: number
    judgmentLineAlpha: number
    divisionLineAlpha: number
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
    judgmentLineStyle: object.judgmentLineStyle,
    leftBorderStyle: object.leftBorderStyle,
    rightBorderStyle: object.rightBorderStyle,
    isFullWidth: object.isFullWidth,
    stageAlpha: object.stageAlpha,
    noteAlpha: object.noteAlpha,
    laneAlpha: object.laneAlpha,
    judgmentLineAlpha: object.judgmentLineAlpha,
    divisionLineAlpha: object.divisionLineAlpha,
    eventEase: object.eventEase,
})
