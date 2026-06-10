import type { BaseEventJointEntity } from '..'
import type { StageId } from '../../../../../chart/stages'
import type { StageMaskEventJointEntity } from './mask'
import type { StagePivotEventJointEntity } from './pivot'
import type { StageStyleEventJointEntity } from './style'

export type StageEventJointEntity =
    | StageMaskEventJointEntity
    | StagePivotEventJointEntity
    | StageStyleEventJointEntity

export type StageEventJointEntityType = StageEventJointEntity['type']

export type BaseStageEventJointEntity = BaseEventJointEntity & {
    stageId: StageId
}
