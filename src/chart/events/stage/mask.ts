import type { EventEase } from '..'
import type { StageId } from '../../stages'

export type StageMaskEventObject = {
    stageId: StageId
    beat: number
    maskLeft: number
    maskSize: number
    eventEase: EventEase
}
