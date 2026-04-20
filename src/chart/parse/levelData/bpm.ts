import { Type } from '@sinclair/typebox'
import { EngineArchetypeDataName, EngineArchetypeName } from '@sonolus/core'
import { getValue, type ParseCtx } from '.'
import { beatSchema } from './schemas'

export const parseBpmsToChart = ({ chart, entities }: ParseCtx) => {
    for (const entity of entities) {
        if (entity.archetype !== EngineArchetypeName.BpmChange) continue

        chart.bpms.push({
            beat: getValue(entity, EngineArchetypeDataName.Beat, beatSchema),
            bpm: getValue(entity, EngineArchetypeDataName.Bpm, valueSchema),
        })
    }
}

const valueSchema = Type.Number({ exclusiveMinimum: 0 })
