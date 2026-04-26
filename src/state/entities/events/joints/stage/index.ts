import type { BaseEventJointEntity } from '..'
import type { StageId } from '../../../../../chart/stages'
import type { StageMaskEventJointEntity } from './mask'

export type StageEventJointEntity = StageMaskEventJointEntity

export type StageEventJointEntityType = StageEventJointEntity['type']

export type BaseStageEventJointEntity = BaseEventJointEntity & {
    stageId: StageId
}
