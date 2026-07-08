import type { BaseEventJointEntity } from '..'
import type { StageId } from '../../../../../chart/stages'
import type { StageMaskEventJointEntity } from './mask'
import type { StagePivotEventJointEntity } from './pivot'
import type { StageStyleEventJointEntity } from './style'
import type { StageTransformEventJointEntity } from './transform'

export type StageEventJointEntity =
    | StageMaskEventJointEntity
    | StagePivotEventJointEntity
    | StageStyleEventJointEntity
    | StageTransformEventJointEntity

export type StageEventJointEntityType = StageEventJointEntity['type']

export type BaseStageEventJointEntity = BaseEventJointEntity & {
    stageId: StageId
}
