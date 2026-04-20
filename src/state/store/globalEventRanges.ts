import type { Range } from '../../utils/range'
import type { EntityOfType } from '../entities'
import type { GlobalEventJointEntityType } from '../entities/events/joints'

export type GlobalEventRanges = {
    [T in GlobalEventJointEntityType]?: Range<EntityOfType<T>>
}
