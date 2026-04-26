import type { BaseEntity } from '../..'
import type { EventEase } from '../../../../chart/events'
import type { CameraEventJointEntity } from './camera'
import type { StageEventJointEntity } from './stage'

export type EventJointEntity = GlobalEventJointEntity | StageEventJointEntity

export type EventJointEntityType = EventJointEntity['type']

export type GlobalEventJointEntity = CameraEventJointEntity

export type GlobalEventJointEntityType = GlobalEventJointEntity['type']

export type BaseEventJointEntity = BaseEntity & {
    eventEase: EventEase
}
