import type { LevelData } from '@sonolus/core'
import type { Store } from '../state/store'
import { serializeToLevelDataEntities } from './entities/serialize'

export const serializeToLevelData = (
    initialLife: number,
    bgmOffset: number,
    store: Store,
    groupCount: number,
): LevelData => ({
    bgmOffset,
    entities: [
        {
            archetype: 'Initialization',
            data: [
                {
                    name: 'initialLife',
                    value: initialLife,
                },
            ],
        },
        ...serializeToLevelDataEntities(store, groupCount),
    ],
})
