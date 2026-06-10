import type { BaseEntity } from '../..'
import type { EventEase } from '../../../../chart/events'
import type { CameraEventJointEntity } from './camera'

export type EventJointEntity = GlobalEventJointEntity

export type EventJointEntityType = EventJointEntity['type']

export type GlobalEventJointEntity = CameraEventJointEntity

export type GlobalEventJointEntityType = GlobalEventJointEntity['type']

export type BaseEventJointEntity = BaseEntity & {
    eventEase: EventEase
}
