import type { BaseEntity } from '../../..'
import type { Range } from '../../../../../utils/range'
import type { StageEventJointEntity } from '../../joints/stage'
import type { StageMaskEventConnectionEntity } from './mask'

export type StageEventConnectionEntity = StageMaskEventConnectionEntity

export type StageEventConnectionEntityType = StageEventConnectionEntity['type']

export type BaseStageEventConnectionEntity<T extends StageEventJointEntity> = BaseEntity & Range<T>
