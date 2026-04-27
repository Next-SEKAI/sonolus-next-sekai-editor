import type { BaseStageEventConnectionEntity } from '.'
import { toEventConnectionEntity } from '..'
import type { StagePivotEventJointEntity } from '../../joints/stage/pivot'

export type StagePivotEventConnectionEntity =
    BaseStageEventConnectionEntity<StagePivotEventJointEntity> & {
        type: 'stagePivotEventConnection'
    }

export const toStagePivotEventConnectionEntity = (
    min: StagePivotEventJointEntity,
    max: StagePivotEventJointEntity,
): StagePivotEventConnectionEntity => ({
    type: 'stagePivotEventConnection',
    ...toEventConnectionEntity(min, max),
})
