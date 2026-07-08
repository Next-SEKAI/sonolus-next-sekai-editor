import type { BaseStageEventConnectionEntity } from '.'
import { toEventConnectionEntity } from '..'
import type { StageTransformEventJointEntity } from '../../joints/stage/transform'

export type StageTransformEventConnectionEntity =
    BaseStageEventConnectionEntity<StageTransformEventJointEntity> & {
        type: 'stageTransformEventConnection'
    }

export const toStageTransformEventConnectionEntity = (
    min: StageTransformEventJointEntity,
    max: StageTransformEventJointEntity,
): StageTransformEventConnectionEntity => ({
    type: 'stageTransformEventConnection',
    ...toEventConnectionEntity(min, max),
})
