import { EngineArchetypeDataName, type LevelDataEntity } from '@sonolus/core'
import { serializeStageEventsToLevelDataEntities } from '.'
import { eventEases } from '..'
import { getStoreEntities } from '../..'
import type { StageId } from '../../../../../chart/stages'
import type { Store } from '../../../../../state/store'

export const serializeStagePivotEventsToLevelDataEntities = (
    isDynamicStages: boolean,
    stageEntities: Map<StageId, LevelDataEntity> | undefined,
    store: Store,
    getName: () => string,
) => {
    if (!isDynamicStages) return []

    return serializeStageEventsToLevelDataEntities(
        getStoreEntities(store.grid.stagePivotEventConnection),
        store.stageEventRanges.stagePivotEventJoint,
        getName,
        (joint) => ({
            archetype: 'StagePivotChange',
            data: [
                {
                    name: EngineArchetypeDataName.Beat,
                    value: joint.beat,
                },
                {
                    name: 'lane',
                    value: joint.pivotLane,
                },
                {
                    name: 'divisionSize',
                    value: joint.divisionSize,
                },
                {
                    name: 'divisionParity',
                    value: divisionParities[joint.divisionParity],
                },
                {
                    name: 'yOffset',
                    value: joint.yOffset,
                },
                {
                    name: 'yBeatOffset',
                    value: joint.yOffsetBeat,
                },
                {
                    name: 'ease',
                    value: eventEases[joint.eventEase],
                },
            ],
        }),
        stageEntities,
        'firstPivotChange',
    )
}

const divisionParities = {
    even: 0,
    odd: 1,
}
