import { EngineArchetypeDataName, EngineArchetypeName, type LevelDataEntity } from '@sonolus/core'
import { getStoreEntities } from '.'
import type { Store } from '../../../state/store'

export const serializeBpmsToLevelDataEntities = (store: Store) =>
    [...getStoreEntities(store.grid.bpm)].map(
        (bpm): LevelDataEntity => ({
            archetype: EngineArchetypeName.BpmChange,
            data: [
                {
                    name: EngineArchetypeDataName.Beat,
                    value: bpm.beat,
                },
                {
                    name: EngineArchetypeDataName.Bpm,
                    value: bpm.bpm,
                },
            ],
        }),
    )
