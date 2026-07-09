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

export type JudgmentLineStyle = 'default' | 'singleLine'

export type BorderStyle = 'default' | 'light' | 'medium' | 'disabled'

export type StageStyleEventObject = {
    stageId: StageId
    beat: number
    editorLane: number
    judgmentLineColor: JudgmentLineColor
    judgmentLineStyle: JudgmentLineStyle
    leftBorderStyle: BorderStyle
    rightBorderStyle: BorderStyle
    isFullWidth: boolean
    stageAlpha: number
    laneAlpha: number
    judgmentLineAlpha: number
    divisionLineAlpha: number
    eventEase: EventEase
}
