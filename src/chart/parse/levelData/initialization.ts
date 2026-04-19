import { Type } from '@sinclair/typebox'
import { getOptionalValue, type ParseToChart } from '.'

export const parseInitializationToChart: ParseToChart = ({ chart, entities: [entity] }) => {
    if (entity?.archetype !== 'Initialization') return

    chart.initialLife = getOptionalValue(entity, 'initialLife', initialLifeSchema) ?? 1000
}

const initialLifeSchema = Type.Number({ minimum: 1, multipleOf: 1 })
