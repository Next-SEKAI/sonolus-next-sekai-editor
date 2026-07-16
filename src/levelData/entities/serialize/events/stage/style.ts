import { EngineArchetypeDataName, type LevelDataEntity } from '@sonolus/core'
import { serializeStageEventsToLevelDataEntities } from '.'
import { eventEases } from '..'
import { getStoreEntities } from '../..'
import type { StageId } from '../../../../../chart/stages'
import type { Store } from '../../../../../state/store'

export const serializeStageStyleEventsToLevelDataEntities = (
    isDynamicStages: boolean,
    stageEntities: Map<StageId, LevelDataEntity> | undefined,
    store: Store,
    getName: () => string,
) => {
    if (!isDynamicStages) return []

    return serializeStageEventsToLevelDataEntities(
        getStoreEntities(store.grid.stageStyleEventConnection),
        store.stageEventRanges.stageStyleEventJoint,
        getName,
        (joint) => ({
            archetype: 'StageStyleChange',
            data: [
                {
                    name: EngineArchetypeDataName.Beat,
                    value: joint.beat,
                },
                {
                    name: 'editorLane',
                    value: joint.editorLane,
                },
                {
                    name: 'judgeLineColor',
                    value: judgmentLineColors[joint.judgmentLineColor],
                },
                {
                    name: 'judgeLineStyle',
                    value: judgeLineStyles[joint.judgmentLineStyle],
                },
                {
                    name: 'leftBorderStyle',
                    value: borderStyles[joint.leftBorderStyle],
                },
                {
                    name: 'rightBorderStyle',
                    value: borderStyles[joint.rightBorderStyle],
                },
                {
                    name: 'fullWidth',
                    value: +joint.isFullWidth,
                },
                {
                    name: 'alpha',
                    value: joint.stageAlpha,
                },
                {
                    name: 'noteAlpha',
                    value: joint.noteAlpha,
                },
                {
                    name: 'laneAlpha',
                    value: joint.laneAlpha,
                },
                {
                    name: 'judgeLineAlpha',
                    value: joint.judgmentLineAlpha,
                },
                {
                    name: 'divisionLineAlpha',
                    value: joint.divisionLineAlpha,
                },
                {
                    name: 'ease',
                    value: eventEases[joint.eventEase],
                },
            ],
        }),
        stageEntities,
        'firstStyleChange',
    )
}

const judgmentLineColors = {
    neutral: 0,
    red: 1,
    green: 2,
    blue: 3,
    yellow: 4,
    purple: 5,
    cyan: 6,
    black: 7,
}

const judgeLineStyles = {
    default: 0,
    singleLine: 1,
}

const borderStyles = {
    default: 0,
    light: 1,
    disabled: 2,
    medium: 3,
}
