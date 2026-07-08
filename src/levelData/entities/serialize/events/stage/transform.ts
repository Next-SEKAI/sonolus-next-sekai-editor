import { EngineArchetypeDataName, type LevelDataEntity } from '@sonolus/core'
import { serializeStageEventsToLevelDataEntities } from '.'
import { eventEases } from '..'
import { getStoreEntities } from '../..'
import type { StageId } from '../../../../../chart/stages'
import type { Store } from '../../../../../state/store'

export const serializeStageTransformEventsToLevelDataEntities = (
    isDynamicStages: boolean,
    stageEntities: Map<StageId, LevelDataEntity> | undefined,
    store: Store,
    getName: () => string,
) => {
    if (!isDynamicStages) return []

    return serializeStageEventsToLevelDataEntities(
        getStoreEntities(store.grid.stageTransformEventConnection),
        store.stageEventRanges.stageTransformEventJoint,
        getName,
        (joint) => ({
            archetype: 'StageTransformChange',
            data: [
                {
                    name: EngineArchetypeDataName.Beat,
                    value: joint.beat,
                },
                {
                    name: 'rotate',
                    value: joint.rotation,
                },
                {
                    name: 'xLaneTranslate',
                    value: joint.xTranslation,
                },
                {
                    name: 'yLaneTranslate',
                    value: joint.yTranslation,
                },
                {
                    name: 'anchor',
                    value: anchors[joint.anchor],
                },
                {
                    name: 'ease',
                    value: eventEases[joint.eventEase],
                },
            ],
        }),
        stageEntities,
        'firstTransformChange',
    )
}

const anchors = {
    default: 0,
    center: 1,
}
