import type { Groups } from '../../../chart/groups'
import type { Store } from '../../../state/store'
import { serializeBpmsToLevelDataEntities } from './bpm'
import { serializeGroupsToLevelDataEntities } from './group'
import { serializeSlidesToLevelDataEntities } from './slide'
import { serializeTimeScalesToLevelDataEntities } from './timeScale'

export const serializeToLevelDataEntities = (store: Store, groups: Groups) => {
    let id = 0
    const getName = () => (id++).toString(16)

    const bpmEntities = serializeBpmsToLevelDataEntities(store)

    const groupEntities = serializeGroupsToLevelDataEntities(groups)

    const timeScaleEntities = serializeTimeScalesToLevelDataEntities(groupEntities, store, getName)

    const slideEntities = serializeSlidesToLevelDataEntities(groupEntities, store, getName)

    return [...bpmEntities, ...groupEntities.values(), ...timeScaleEntities, ...slideEntities]
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
