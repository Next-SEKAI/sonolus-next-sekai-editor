import { type BaseEntity } from '.'
import type { TimeScaleEase, TimeScaleObject } from '../../chart'
import type { GroupId } from '../groups'

export type TimeScaleEntity = BaseEntity & {
    type: 'timeScale'
    groupId: GroupId
    timeScale: number
    skip: number
    ease: TimeScaleEase
    hideNotes: boolean
}

export const toTimeScaleEntity = (object: TimeScaleObject): TimeScaleEntity => ({
    type: 'timeScale',
    hitbox: {
        lane: -6.5,
        beat: object.beat,
        w: 0.5,
        h: 0.4,
    },

    groupId: object.groupId,
    beat: object.beat,
    timeScale: object.timeScale,
    skip: object.skip,
    ease: object.ease,
    hideNotes: object.hideNotes,
})
