import type { BaseStageEventConnectionEntity } from '.'
import { toEventConnectionEntity } from '..'
import type { StageMaskEventJointEntity } from '../../joints/stage/mask'

export type StageMaskEventConnectionEntity =
    BaseStageEventConnectionEntity<StageMaskEventJointEntity> & {
        type: 'stageMaskEventConnection'
    }

export const toStageMaskEventConnectionEntity = (
    min: StageMaskEventJointEntity,
    max: StageMaskEventJointEntity,
): StageMaskEventConnectionEntity => ({
    type: 'stageMaskEventConnection',
    ...toEventConnectionEntity(min, max),
})
