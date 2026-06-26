import Type from 'typebox'
import { getOptionalRef, getOptionalValue, type ParseCtx } from '.'

export const parseInitializationToChart = ({ chart, entities: [entity] }: ParseCtx) => {
    if (entity?.archetype !== 'Initialization') return

    chart.initialLife = getOptionalValue(entity, 'initialLife', initialLifeSchema) ?? 1000
    return getOptionalRef(entity, 'firstCamera')
}

const initialLifeSchema = Type.Number({ minimum: 1, multipleOf: 1 })
