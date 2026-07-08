import type { EventEase } from '..'
import type { StageId } from '../../stages'

export type Anchor = 'default' | 'center'

export type StageTransformEventObject = {
    stageId: StageId
    beat: number
    rotation: number
    xTranslation: number
    yTranslation: number
    anchor: Anchor
    eventEase: EventEase
}
