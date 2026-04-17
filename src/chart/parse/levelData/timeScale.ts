import { Type } from '@sinclair/typebox'
import { EngineArchetypeDataName, EngineArchetypeName } from '@sonolus/core'
import { getOptionalValue, getValue, type ParseToChart } from '.'
import { beatSchema } from './schemas'

export const parseTimeScalesToChart: ParseToChart = (chart, entities, getGroup, addGroup) => {
    for (const entity of entities) {
        if (entity.archetype !== '#TIMESCALE_GROUP') continue

        addGroup(entity.name)
    }

    for (const entity of entities) {
        if (entity.archetype !== EngineArchetypeName.TimeScaleChange) continue

        chart.timeScales.push({
            group: getGroup(entity),
            beat: getValue(entity, EngineArchetypeDataName.Beat, beatSchema),
            timeScale: getValue(entity, EngineArchetypeDataName.TimeScale, valueSchema),
            skip: getValue(entity, '#TIMESCALE_SKIP', skipSchema),
            ease: eases[getValue(entity, '#TIMESCALE_EASE', easeSchema)],
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
