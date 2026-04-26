import type { StageId } from '../../chart/stages'
import type { Range } from '../../utils/range'
import type { EntityOfType } from '../entities'
import type { StageEventJointEntityType } from '../entities/events/joints/stage'

export type StageEventRanges = {
    [T in StageEventJointEntityType]: Map<StageId, Range<EntityOfType<T>>>
}
