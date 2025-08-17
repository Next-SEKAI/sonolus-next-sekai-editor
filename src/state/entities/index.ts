import type { BpmEntity } from './bpm'
import type { SlideEntity } from './slides'
import type { TimeScaleEntity } from './timeScale'

export type EntityHitbox = {
    lane: number
    beat: number
    w: number
    h: number
}

export type BaseEntity = {
    hitbox?: EntityHitbox

    beat: number
}

export type Entity = BpmEntity | TimeScaleEntity | SlideEntity

export type EntityType = Entity['type']

export type EntityOfType<T extends EntityType> = Entity & { type: T }
