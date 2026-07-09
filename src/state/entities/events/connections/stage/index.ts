import type { BaseEntity } from '../../..'
import type { Range } from '../../../../../utils/range'
import type { StageEventJointEntity } from '../../joints/stage'
import type { StageMaskEventConnectionEntity } from './mask'
import type { StagePivotEventConnectionEntity } from './pivot'
import type { StageStyleEventConnectionEntity } from './style'
import type { StageTransformEventConnectionEntity } from './transform'

export type StageEventConnectionEntity =
    | StageMaskEventConnectionEntity
    | StagePivotEventConnectionEntity
    | StageStyleEventConnectionEntity
    | StageTransformEventConnectionEntity

export type StageEventConnectionEntityType = StageEventConnectionEntity['type']

export type BaseStageEventConnectionEntity<T extends StageEventJointEntity> = BaseEntity & Range<T>
