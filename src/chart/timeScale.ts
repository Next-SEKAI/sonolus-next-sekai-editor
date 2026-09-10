import type { GroupId } from './groups'

export type TimeScaleEase = 'none' | 'linear' | 'inQuad' | 'outQuad' | 'inOutQuad' | 'outInQuad'

export type TimeScaleTransition = 'timeScale' | 'scroll'

export type TimeScaleObject = {
    groupId: GroupId
    beat: number
    editorLane: number
    timeScale: number
    skip: number
    timeScaleEase: TimeScaleEase
    timeScaleTransition: TimeScaleTransition
    hideNotes: boolean
}
