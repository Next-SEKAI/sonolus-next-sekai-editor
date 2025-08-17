import { Type } from '@sinclair/typebox'
import { EngineArchetypeDataName, EngineArchetypeName } from '@sonolus/core'
import { getValue, type ParseToChart } from '.'
import { beatSchema } from './schemas'

export const parseBpmsToChart: ParseToChart = (chart, _, entities) => {
    for (const entity of entities) {
        if (entity.archetype !== EngineArchetypeName.BpmChange) continue

        chart.bpms.push({
            beat: getValue(entity, EngineArchetypeDataName.Beat, beatSchema),
            bpm: getValue(entity, EngineArchetypeDataName.Bpm, valueSchema),
        })
    }
}

const valueSchema = Type.Number({ exclusiveMinimum: 0 })
