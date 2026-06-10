import { Type } from '@sinclair/typebox'
import { EngineArchetypeDataName } from '@sonolus/core'
import { parseStageEvents } from '.'
import { getEventRefs } from '..'
import { getValue, type ParseCtx } from '../..'
import type { StageId } from '../../../../stages'
import { beatSchema } from '../../schemas'
import { eventEases, eventEaseSchema } from '../schemas'

export const parseStageMaskEventsToChart = (
    { chart, entities }: ParseCtx,
    firstRefs: Map<StageId, string>,
) => {
    if (!firstRefs.size) return
    if (!chart.isDynamicStages)
        throw new Error('Invalid level: dynamic stage features used but not enabled')

    const refs = getEventRefs(entities, 'StageMaskChange')

    parseStageEvents(refs, firstRefs, chart.stageMaskEvents, (stageId, entity) => {
        const lane = getValue(entity, 'lane', laneSchema)
        const size = getValue(entity, 'size', sizeSchema)

        return {
            stageId,
            beat: getValue(entity, EngineArchetypeDataName.Beat, beatSchema),
            maskLeft: lane - size,
            maskSize: size * 2,
            eventEase: eventEases[getValue(entity, 'ease', eventEaseSchema)],
        }
    })
}

const laneSchema = Type.Number()

const sizeSchema = Type.Number({ minimum: 0 })
