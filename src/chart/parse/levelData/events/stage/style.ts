import { EngineArchetypeDataName } from '@sonolus/core'
import Type from 'typebox'
import { parseStageEvents } from '.'
import { getEventRefs } from '..'
import { getOptionalValue, getValue, type ParseCtx } from '../..'
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

    parseStageEvents(refs, firstRefs, chart.stageStyleEvents, (stageId, entity) => {
        const alpha = getOptionalValue(entity, 'alpha', alphaSchema) ?? 1

        return {
            stageId,
            beat: getValue(entity, EngineArchetypeDataName.Beat, beatSchema),
            editorLane: getOptionalValue(entity, 'editorLane', editorLaneSchema) ?? 0,
            judgmentLineColor:
                judgmentLineColors[getValue(entity, 'judgeLineColor', judgmentLineColorSchema)],
            judgmentLineStyle:
                judgmentLineStyles[
                    getOptionalValue(entity, 'judgeLineStyle', judgeLineStyleSchema) ?? 0
                ],
            leftBorderStyle: borderStyles[getValue(entity, 'leftBorderStyle', borderStyleSchema)],
            rightBorderStyle: borderStyles[getValue(entity, 'rightBorderStyle', borderStyleSchema)],
            isFullWidth: !!getOptionalValue(entity, 'fullWidth', fullWidthSchema),
            noteAlpha: getOptionalValue(entity, 'noteAlpha', alphaSchema) ?? 1,
            laneAlpha: getValue(entity, 'laneAlpha', alphaSchema) * alpha,
            judgmentLineAlpha: getValue(entity, 'judgeLineAlpha', alphaSchema) * alpha,
            divisionLineAlpha: getOptionalValue(entity, 'divisionLineAlpha', alphaSchema) ?? 1,
            eventEase: eventEases[getValue(entity, 'ease', eventEaseSchema)],
        }
    })
}

const editorLaneSchema = Type.Number()

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

const judgeLineStyleSchema = Type.Union([Type.Literal(0), Type.Literal(1)])

const judgmentLineStyles = {
    0: 'default',
    1: 'singleLine',
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

const fullWidthSchema = Type.Number()

const alphaSchema = Type.Number({ minimum: 0, maximum: 1 })
