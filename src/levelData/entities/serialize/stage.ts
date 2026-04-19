import { type LevelDataEntity } from '@sonolus/core'
import type { StageId, Stages } from '../../../chart/stages'

export const serializeStagesToLevelDataEntities = (isDynamicStages: boolean, stages: Stages) => {
    if (!isDynamicStages) return

    return new Map(
        [...stages.entries()].map(
            ([id, { name, isFromStart, isUntilEnd }]): [StageId, LevelDataEntity] => [
                id,
                {
                    archetype: 'Stage',
                    data: [
                        {
                            name: 'editorName',
                            ref: name,
                        },
                        {
                            name: 'fromStart',
                            value: +isFromStart,
                        },
                        {
                            name: 'untilEnd',
                            value: +isUntilEnd,
                        },
                    ],
                },
            ],
        ),
    )
}
