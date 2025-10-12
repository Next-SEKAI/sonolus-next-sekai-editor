import { EngineArchetypeDataName, EngineArchetypeName, type LevelDataEntity } from '@sonolus/core'
import { getStoreEntities } from '.'
import type { TimeScaleEntity } from '../../../state/entities/timeScale'
import type { Store } from '../../../state/store'

export const serializeTimeScaleGroupsToLevelDataEntities = (groupCount: number) =>
    [...Array(groupCount - 1).keys()].map(
        (): LevelDataEntity => ({
            archetype: '#TIMESCALE_GROUP',
            data: [],
        }),
    )

export const serializeTimeScaleChangesToLevelDataEntities = (
    timeScaleGroupEntities: LevelDataEntity[],
    store: Store,
    getName: () => string,
) => {
    const timeScalesByGroup = new Map<number, TimeScaleEntity[]>()

    for (const timeScale of getStoreEntities(store.grid.timeScale)) {
        const timeScales = timeScalesByGroup.get(timeScale.group)
        if (timeScales) {
            timeScales.push(timeScale)
        } else {
            timeScalesByGroup.set(timeScale.group, [timeScale])
        }
    }

    const entities: LevelDataEntity[] = []

    for (const [group, timeScales] of timeScalesByGroup) {
        const timeScaleGroup = timeScaleGroupEntities[group]
        if (!timeScaleGroup) throw new Error(`Unexpected missing group ${group}`)

        let prev: LevelDataEntity | undefined
        entities.push(
            ...timeScales
                .sort((a, b) => a.beat - b.beat)
                .map((timeScale) => {
                    const entity: LevelDataEntity = {
                        archetype: EngineArchetypeName.TimeScaleChange,
                        data: [
                            {
                                name: '#TIMESCALE_GROUP',
                                ref: (timeScaleGroup.name ??= getName()),
                            },
                            {
                                name: EngineArchetypeDataName.Beat,
                                value: timeScale.beat,
                            },
                            {
                                name: EngineArchetypeDataName.TimeScale,
                                value: timeScale.timeScale,
                            },
                            {
                                name: '#TIMESCALE_SKIP',
                                value: timeScale.skip,
                            },
                            {
                                name: '#TIMESCALE_EASE',
                                value: timeScaleEases[timeScale.ease],
                            },
                            {
                                name: 'hideNotes',
                                value: +timeScale.hideNotes,
                            },
                        ],
                    }

                    if (prev) {
                        prev.data.push({
                            name: 'next',
                            ref: (entity.name ??= getName()),
                        })
                    } else {
                        timeScaleGroup.data.push({
                            name: 'first',
                            ref: (entity.name ??= getName()),
                        })
                    }

                    return (prev = entity)
                }),
        )
    }

    return entities
}

const timeScaleEases = {
    none: 0,
    linear: 1,
}
