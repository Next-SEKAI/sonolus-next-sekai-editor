import { EngineArchetypeDataName } from '@sonolus/core'
import Type from 'typebox'
import { parseStageEvents } from '.'
import { getEventRefs } from '..'
import { getValue, type ParseCtx } from '../..'
import type { StageId } from '../../../../stages'
import { beatSchema } from '../../schemas'
import { eventEases, eventEaseSchema } from '../schemas'

export const parseStageTransformEventsToChart = (
    { chart, entities }: ParseCtx,
    firstRefs: Map<StageId, string>,
) => {
    if (!firstRefs.size) return
    if (!chart.isDynamicStages)
        throw new Error('Invalid level: dynamic stage features used but not enabled')

    const refs = getEventRefs(entities, 'StageTransformChange')

    parseStageEvents(refs, firstRefs, chart.stageTransformEvents, (stageId, entity) => ({
        stageId,
        beat: getValue(entity, EngineArchetypeDataName.Beat, beatSchema),
        rotation: getValue(entity, 'rotate', rotateSchema),
        xTranslation: getValue(entity, 'xLaneTranslate', xLaneTranslateSchema),
        yTranslation: getValue(entity, 'yLaneTranslate', yLaneTranslateSchema),
        anchor: anchors[getValue(entity, 'anchor', anchorSchema)],
        eventEase: eventEases[getValue(entity, 'ease', eventEaseSchema)],
    }))
}

const rotateSchema = Type.Number()

const xLaneTranslateSchema = Type.Number()

const yLaneTranslateSchema = Type.Number()

const anchorSchema = Type.Union([Type.Literal(0), Type.Literal(1)])

const anchors = {
    0: 'default',
    1: 'center',
} as const
