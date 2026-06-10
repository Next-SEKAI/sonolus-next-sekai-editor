import type { EventEase } from '..'
import type { StageId } from '../../stages'

export type DivisionParity = 'even' | 'odd'

export type StagePivotEventObject = {
    stageId: StageId
    beat: number
    pivotLane: number
    divisionSize: number
    divisionParity: DivisionParity
    yOffset: number
    yOffsetBeat: number
    eventEase: EventEase
}
