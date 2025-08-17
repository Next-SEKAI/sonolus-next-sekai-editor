import { type BaseEntity } from '.'
import type { BpmObject } from '../../chart'

export type BpmEntity = BaseEntity & {
    type: 'bpm'
    bpm: number
}

export const toBpmEntity = (object: BpmObject): BpmEntity => ({
    type: 'bpm',
    hitbox: {
        lane: 6.5,
        beat: object.beat,
        w: 0.5,
        h: 0.4,
    },

    beat: object.beat,
    bpm: object.bpm,
})
