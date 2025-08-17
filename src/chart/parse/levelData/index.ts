import { type Static, type TSchema } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'
import { type LevelDataEntity } from '@sonolus/core'
import type { Chart } from '../..'
import { parseBpmsToChart } from './bpm'
import { parseSlidesToChart } from './slide'
import { parseTimeScalesToChart } from './timeScale'

export type TimeScaleNames = (string | undefined)[]

export type ParseToChart = (
    chart: Chart,
    timeScaleNames: TimeScaleNames,
    entities: LevelDataEntity[],
) => void

export const parseLevelDataChart = (entities: LevelDataEntity[]): Chart => {
    const chart: Chart = {
        bpms: [],
        groupCount: 2,
        timeScales: [],
        slides: [],
    }

    const timeScaleNames: TimeScaleNames = []

    parseBpmsToChart(chart, timeScaleNames, entities)
    parseTimeScalesToChart(chart, timeScaleNames, entities)

    parseSlidesToChart(chart, timeScaleNames, entities)

    return chart
}

export const getValue = <T extends TSchema>(
    entity: LevelDataEntity,
    name: string,
    schema: T,
): Static<T> => {
    const data = entity.data.find((data) => data.name === name)
    if (!data) throw new Error(`Invalid level: data ${name} not found`)
    if (!('value' in data)) throw new Error(`Invalid level: data ${name} has no value`)

    Value.Assert(schema, data.value)
    return data.value
}

export const getOptionalValue = <T extends TSchema>(
    entity: LevelDataEntity,
    name: string,
    schema: T,
): Static<T> => {
    const data = entity.data.find((data) => data.name === name)
    if (!data) return
    if (!('value' in data)) return

    Value.Assert(schema, data.value)
    return data.value
}

export const getRef = (entity: LevelDataEntity, name: string) => {
    const data = entity.data.find((data) => data.name === name)
    if (!data) throw new Error(`Invalid level: data ${name} not found`)
    if (!('ref' in data)) throw new Error(`Invalid level: data ${name} has no ref`)

    return data.ref
}

export const getOptionalRef = (entity: LevelDataEntity, name: string) => {
    const data = entity.data.find((data) => data.name === name)
    if (!data) return
    if (!('ref' in data)) return

    return data.ref
}

export const getGroup = (chart: Chart, timeScaleNames: TimeScaleNames, entity: LevelDataEntity) => {
    const group = getRef(entity, '#TIMESCALE_GROUP')
    const index = timeScaleNames.indexOf(group)
    if (index === -1) throw new Error(`Invalid level: ref "${group}" not found`)

    chart.groupCount = Math.max(chart.groupCount, index + 2)
    return index
}
