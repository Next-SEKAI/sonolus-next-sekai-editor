import { EngineArchetypeDataName, EngineArchetypeName } from '@sonolus/core'
import Type from 'typebox'
import { getOptionalValue, getValue, type ParseCtx } from '.'
import { beatSchema } from './schemas'

export const parseTimeScalesToChart = ({ chart, entities, getGroupId }: ParseCtx) => {
    for (const entity of entities) {
        if (entity.archetype !== EngineArchetypeName.TimeScaleChange) continue

        chart.timeScales.push({
            groupId: getGroupId(entity),
            beat: getValue(entity, EngineArchetypeDataName.Beat, beatSchema),
            editorLane: getOptionalValue(entity, 'editorLane', editorLaneSchema) ?? -6,
            timeScale: getValue(entity, EngineArchetypeDataName.TimeScale, valueSchema),
            skip: getValue(entity, '#TIMESCALE_SKIP', skipSchema),
            timeScaleEase: eases[getValue(entity, '#TIMESCALE_EASE', easeSchema)],
            hideNotes: !!getOptionalValue(entity, 'hideNotes', hideNotesSchema),
        })
    }
}

const editorLaneSchema = Type.Number()

const valueSchema = Type.Number()

const skipSchema = Type.Number()

const easeSchema = Type.Union([
    Type.Literal(0),
    Type.Literal(1),
    Type.Literal(2),
    Type.Literal(3),
    Type.Literal(4),
    Type.Literal(5),
])

const eases = {
    0: 'none',
    1: 'linear',
    2: 'inQuad',
    3: 'outQuad',
    4: 'inOutQuad',
    5: 'outInQuad',
} as const

const hideNotesSchema = Type.Number()
