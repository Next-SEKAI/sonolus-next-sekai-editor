import type { Groups } from '../../../chart/groups'
import type { Stages } from '../../../chart/stages'
import type { Store } from '../../../state/store'
import { serializeBpmsToLevelDataEntities } from './bpm'
import { serializeCameraEventsToLevelDataEntities } from './events/camera'
import { serializeStageMaskEventsToLevelDataEntities } from './events/stage/mask'
import { serializeStagePivotEventsToLevelDataEntities } from './events/stage/pivot'
import { serializeStageStyleEventsToLevelDataEntities } from './events/stage/style'
import { serializeGroupsToLevelDataEntities } from './group'
import { serializeSlidesToLevelDataEntities } from './slide'
import { serializeStagesToLevelDataEntities } from './stage'
import { serializeTimeScalesToLevelDataEntities } from './timeScale'

export const serializeToLevelDataEntities = (
    initialLife: number,
    isDynamicStages: boolean,
    store: Store,
    groups: Groups,
    stages: Stages,
) => {
    let id = 0
    const getName = () => (id++).toString(16)

    const initialization = {
        archetype: 'Initialization',
        data: [
            {
                name: 'initialLife',
                value: initialLife,
            },
        ],
    }

    const bpmEntities = serializeBpmsToLevelDataEntities(store)

    const groupEntities = serializeGroupsToLevelDataEntities(groups)

    const stageEntities = serializeStagesToLevelDataEntities(isDynamicStages, stages)

    const cameraEventEntities = serializeCameraEventsToLevelDataEntities(
        isDynamicStages,
        initialization,
        store,
        getName,
    )

    const stageMaskEventEntities = serializeStageMaskEventsToLevelDataEntities(
        isDynamicStages,
        stageEntities,
        store,
        getName,
    )
    const stagePivotEventEntities = serializeStagePivotEventsToLevelDataEntities(
        isDynamicStages,
        stageEntities,
        store,
        getName,
    )
    const stageStyleEventEntities = serializeStageStyleEventsToLevelDataEntities(
        isDynamicStages,
        stageEntities,
        store,
        getName,
    )

    const timeScaleEntities = serializeTimeScalesToLevelDataEntities(groupEntities, store, getName)

    const slideEntities = serializeSlidesToLevelDataEntities(
        groupEntities,
        stageEntities,
        store,
        getName,
    )

    return [
        initialization,
        ...bpmEntities,
        ...groupEntities.values(),
        ...(stageEntities?.values() ?? []),
        ...cameraEventEntities,
        ...stageMaskEventEntities,
        ...stagePivotEventEntities,
        ...stageStyleEventEntities,
        ...timeScaleEntities,
        ...slideEntities,
    ]
}

export const getStoreEntities = <T>(map: Map<number, Set<T>>) => {
    const entities = new Set<T>()

    for (const set of map.values()) {
        for (const entity of set) {
            entities.add(entity)
        }
    }

    return entities
}
