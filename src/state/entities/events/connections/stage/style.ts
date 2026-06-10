import type { BaseStageEventConnectionEntity } from '.'
import { toEventConnectionEntity } from '..'
import type { StageStyleEventJointEntity } from '../../joints/stage/style'

export type StageStyleEventConnectionEntity =
    BaseStageEventConnectionEntity<StageStyleEventJointEntity> & {
        type: 'stageStyleEventConnection'
    }

export const toStageStyleEventConnectionEntity = (
    min: StageStyleEventJointEntity,
    max: StageStyleEventJointEntity,
): StageStyleEventConnectionEntity => ({
    type: 'stageStyleEventConnection',
    ...toEventConnectionEntity(min, max),
})
