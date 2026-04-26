import type { BaseEntity } from '../..'
import type { Range } from '../../../../utils/range'
import type { EventJointEntity } from '../joints'
import type { CameraEventConnectionEntity } from './camera'
import type { StageEventConnectionEntity } from './stage'

export type EventConnectionEntity = GlobalEventConnectionEntity | StageEventConnectionEntity

export type EventConnectionEntityType = EventConnectionEntity['type']

export type GlobalEventConnectionEntity = CameraEventConnectionEntity

export type BaseEventConnectionEntity<T extends EventJointEntity> = BaseEntity & Range<T>

export const toEventConnectionEntity = <T extends EventJointEntity>(min: T, max: T) => ({
    beat: min.beat,
    min,
    max,
})
