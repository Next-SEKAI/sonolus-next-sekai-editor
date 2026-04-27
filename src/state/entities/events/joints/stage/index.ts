import type { BaseEventJointEntity } from '..'
import type { StageId } from '../../../../../chart/stages'
import type { StageMaskEventJointEntity } from './mask'
import type { StagePivotEventJointEntity } from './pivot'

export type StageEventJointEntity = StageMaskEventJointEntity | StagePivotEventJointEntity

export type StageEventJointEntityType = StageEventJointEntity['type']

export type BaseStageEventJointEntity = BaseEventJointEntity & {
    stageId: StageId
}
