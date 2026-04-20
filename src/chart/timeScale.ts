import type { GroupId } from './groups'

export type TimeScaleEase = 'none' | 'linear'

export type TimeScaleObject = {
    groupId: GroupId
    beat: number
    timeScale: number
    skip: number
    timeScaleEase: TimeScaleEase
    hideNotes: boolean
}
