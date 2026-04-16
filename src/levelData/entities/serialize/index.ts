import type { Groups } from '../../../state/groups'
import type { Store } from '../../../state/store'
import { serializeBpmsToLevelDataEntities } from './bpm'
import { serializeSlidesToLevelDataEntities } from './slide'
import {
    serializeTimeScaleChangesToLevelDataEntities,
    serializeTimeScaleGroupsToLevelDataEntities,
} from './timeScale'

export const serializeToLevelDataEntities = (store: Store, groups: Groups) => {
    let id = 0
    const getName = () => (id++).toString(16)

    const bpmEntities = serializeBpmsToLevelDataEntities(store)

    const timeScaleGroupEntities = serializeTimeScaleGroupsToLevelDataEntities(groups)
    const timeScaleChangeEntities = serializeTimeScaleChangesToLevelDataEntities(
        timeScaleGroupEntities,
        store,
        getName,
    )

    const slideEntities = serializeSlidesToLevelDataEntities(timeScaleGroupEntities, store, getName)

    return [
        ...bpmEntities,
        ...timeScaleGroupEntities.values(),
        ...timeScaleChangeEntities,
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
