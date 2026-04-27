import { Type } from '@sinclair/typebox'
import { EngineArchetypeDataName } from '@sonolus/core'
import { parseStageEvents } from '.'
import { getEventRefs } from '..'
import { getValue, type ParseCtx } from '../..'
import type { StageId } from '../../../../stages'
import { beatSchema } from '../../schemas'
import { eventEases, eventEaseSchema } from '../schemas'

export const parseStageStyleEventsToChart = (
    { chart, entities }: ParseCtx,
    firstRefs: Map<StageId, string>,
) => {
    if (!firstRefs.size) return
    if (!chart.isDynamicStages)
        throw new Error('Invalid level: dynamic stage features used but not enabled')

    const refs = getEventRefs(entities, 'StageStyleChange')

    parseStageEvents(refs, firstRefs, chart.stageStyleEvents, (stageId, entity) => ({
        stageId,
        beat: getValue(entity, EngineArchetypeDataName.Beat, beatSchema),
        judgmentLineColor:
            judgmentLineColors[getValue(entity, 'judgeLineColor', judgmentLineColorSchema)],
        leftBorderStyle: borderStyles[getValue(entity, 'leftBorderStyle', borderStyleSchema)],
        rightBorderStyle: borderStyles[getValue(entity, 'rightBorderStyle', borderStyleSchema)],
        stageAlpha: getValue(entity, 'alpha', alphaSchema),
        laneAlpha: getValue(entity, 'laneAlpha', alphaSchema),
        judgmentLineAlpha: getValue(entity, 'judgeLineAlpha', alphaSchema),
        eventEase: eventEases[getValue(entity, 'ease', eventEaseSchema)],
    }))
}

const judgmentLineColorSchema = Type.Union([
    Type.Literal(0),
    Type.Literal(1),
    Type.Literal(2),
    Type.Literal(3),
    Type.Literal(4),
    Type.Literal(5),
    Type.Literal(6),
    Type.Literal(7),
])

const judgmentLineColors = {
    0: 'neutral',
    1: 'red',
    2: 'green',
    3: 'blue',
    4: 'yellow',
    5: 'purple',
    6: 'cyan',
    7: 'black',
} as const

const borderStyleSchema = Type.Union([
    Type.Literal(0),
    Type.Literal(1),
    Type.Literal(2),
    Type.Literal(3),
])

const borderStyles = {
    0: 'default',
    1: 'light',
    2: 'disabled',
    3: 'medium',
} as const

const alphaSchema = Type.Number({ minimum: 0, maximum: 1 })
