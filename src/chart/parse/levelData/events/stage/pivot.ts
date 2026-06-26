import { EngineArchetypeDataName } from '@sonolus/core'
import Type from 'typebox'
import { parseStageEvents } from '.'
import { getEventRefs } from '..'
import { getValue, type ParseCtx } from '../..'
import type { StageId } from '../../../../stages'
import { beatSchema } from '../../schemas'
import { eventEases, eventEaseSchema } from '../schemas'

export const parseStagePivotEventsToChart = (
    { chart, entities }: ParseCtx,
    firstRefs: Map<StageId, string>,
) => {
    if (!firstRefs.size) return
    if (!chart.isDynamicStages)
        throw new Error('Invalid level: dynamic stage features used but not enabled')

    const refs = getEventRefs(entities, 'StagePivotChange')

    parseStageEvents(refs, firstRefs, chart.stagePivotEvents, (stageId, entity) => ({
        stageId,
        beat: getValue(entity, EngineArchetypeDataName.Beat, beatSchema),
        pivotLane: getValue(entity, 'lane', laneSchema),
        divisionSize: getValue(entity, 'divisionSize', divisionSizeSchema),
        divisionParity: divisionParities[getValue(entity, 'divisionParity', divisionParitySchema)],
        yOffset: getValue(entity, 'yOffset', yOffsetSchema),
        yOffsetBeat: getValue(entity, 'yBeatOffset', yBeatOffsetSchema),
        eventEase: eventEases[getValue(entity, 'ease', eventEaseSchema)],
    }))
}

const laneSchema = Type.Number()

const divisionSizeSchema = Type.Number({ minimum: 1, multipleOf: 1 })

const divisionParitySchema = Type.Union([Type.Literal(0), Type.Literal(1)])

const divisionParities = {
    0: 'even',
    1: 'odd',
} as const

const yOffsetSchema = Type.Number()

const yBeatOffsetSchema = Type.Number()
