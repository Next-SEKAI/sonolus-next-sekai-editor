import type { LevelDataEntity } from '@sonolus/core'
import { serializeEventsToLevelDataEntities } from '..'
import type { StageId } from '../../../../../chart/stages'
import type { BaseStageEventConnectionEntity } from '../../../../../state/entities/events/connections/stage'
import type { StageEventJointEntity } from '../../../../../state/entities/events/joints/stage'
import type { Range } from '../../../../../utils/range'

export const serializeStageEventsToLevelDataEntities = <T extends StageEventJointEntity>(
    connectionEntities: Iterable<BaseStageEventConnectionEntity<T>>,
    ranges: Map<StageId, Range<T>>,
    getName: () => string,
    create: (joint: T) => LevelDataEntity,
    stageEntities: Map<StageId, LevelDataEntity> | undefined,
    refDataName: string,
) => {
    const stageConnectionEntities = new Map<StageId, BaseStageEventConnectionEntity<T>[]>()
    for (const entity of connectionEntities) {
        const entities = stageConnectionEntities.get(entity.min.stageId)
        if (entities) {
            entities.push(entity)
        } else {
            stageConnectionEntities.set(entity.min.stageId, [entity])
        }
    }

    const allEntities: LevelDataEntity[] = []

    for (const [id, range] of ranges) {
        const { ref, entities } = serializeEventsToLevelDataEntities(
            stageConnectionEntities.get(id) ?? [],
            range,
            getName,
            create,
        )

        if (ref) {
            const stage = stageEntities?.get(id)
            if (!stage) throw new Error('Unexpected stage not found')

            stage.data.push({
                name: refDataName,
                ref,
            })
        }

        allEntities.push(...entities)
    }

    return allEntities
}
