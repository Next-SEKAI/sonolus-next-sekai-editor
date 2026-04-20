import { Type } from '@sinclair/typebox'
import { EngineArchetypeDataName, EngineArchetypeName } from '@sonolus/core'
import { getOptionalValue, getValue, type ParseCtx } from '.'
import { beatSchema } from './schemas'

export const parseTimeScalesToChart = ({ chart, entities, getGroupId }: ParseCtx) => {
    for (const entity of entities) {
        if (entity.archetype !== EngineArchetypeName.TimeScaleChange) continue

        chart.timeScales.push({
            groupId: getGroupId(entity),
            beat: getValue(entity, EngineArchetypeDataName.Beat, beatSchema),
            timeScale: getValue(entity, EngineArchetypeDataName.TimeScale, valueSchema),
            skip: getValue(entity, '#TIMESCALE_SKIP', skipSchema),
            timeScaleEase: eases[getValue(entity, '#TIMESCALE_EASE', easeSchema)],
            hideNotes: !!getOptionalValue(entity, 'hideNotes', hideNotesSchema),
        })
    }
}

const valueSchema = Type.Number()

const skipSchema = Type.Number()

const easeSchema = Type.Union([Type.Literal(0), Type.Literal(1)])

const eases = {
    0: 'none',
    1: 'linear',
} as const

const hideNotesSchema = Type.Number()
