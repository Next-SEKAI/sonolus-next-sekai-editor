import { type BaseEntity } from '.'
import type { GroupId } from '../../chart/groups'
import type { TimeScaleEase, TimeScaleObject, TimeScaleTransition } from '../../chart/timeScale'

export type TimeScaleEntity = BaseEntity & {
    type: 'timeScale'
    groupId: GroupId
    editorLane: number
    timeScale: number
    skip: number
    timeScaleEase: TimeScaleEase
    timeScaleTransition: TimeScaleTransition
    hideNotes: boolean
}

export const toTimeScaleEntity = (object: TimeScaleObject): TimeScaleEntity => ({
    type: 'timeScale',
    hitbox: {
        lane: object.editorLane,
        beat: object.beat,
        w: 0.2,
        h: 0.2,
    },

    groupId: object.groupId,
    beat: object.beat,
    editorLane: object.editorLane,
    timeScale: object.timeScale,
    skip: object.skip,
    timeScaleEase: object.timeScaleEase,
    timeScaleTransition: object.timeScaleTransition,
    hideNotes: object.hideNotes,
})
