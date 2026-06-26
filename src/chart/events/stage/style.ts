import type { EventEase } from '..'
import type { StageId } from '../../stages'

export type JudgmentLineColor =
    | 'neutral'
    | 'red'
    | 'green'
    | 'blue'
    | 'yellow'
    | 'purple'
    | 'cyan'
    | 'black'

export type BorderStyle = 'default' | 'light' | 'medium' | 'disabled'

export type StageStyleEventObject = {
    stageId: StageId
    beat: number
    editorLane: number
    judgmentLineColor: JudgmentLineColor
    leftBorderStyle: BorderStyle
    rightBorderStyle: BorderStyle
    stageAlpha: number
    laneAlpha: number
    judgmentLineAlpha: number
    eventEase: EventEase
}
