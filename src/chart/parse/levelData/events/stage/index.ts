import { type LevelDataEntity } from '@sonolus/core'
import { parseEvents } from '..'
import type { StageId } from '../../../../stages'

export const parseStageEvents = <T>(
    refs: Map<string, LevelDataEntity>,
    firstRefs: Map<StageId, string>,
    objects: T[],
    getObject: (stageId: StageId, entity: LevelDataEntity) => NoInfer<T>,
) => {
    for (const [stageId, firstRef] of firstRefs) {
        parseEvents(refs, firstRef, objects, (entity) => getObject(stageId, entity))
    }
}
