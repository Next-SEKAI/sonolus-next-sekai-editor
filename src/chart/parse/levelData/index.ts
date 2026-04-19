import { type Static, type TSchema } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'
import { type LevelDataEntity } from '@sonolus/core'
import type { Chart } from '../..'
import { settings } from '../../../settings'
import { addToGroups, type GroupId, type GroupProperties } from '../../../state/groups'
import { parseBpmsToChart } from './bpm'
import { parseInitializationToChart } from './initialization'
import { parseSlidesToChart } from './slide'
import { parseTimeScalesToChart } from './timeScale'

export type ParseToChart = (ctx: ParseCtx) => void

type ParseCtx = {
    chart: Chart
    entities: LevelDataEntity[]

    getGroupId: (entity: LevelDataEntity) => GroupId
    addGroup: (
        name: string | undefined,
        editorName: string | undefined,
        properties: Omit<GroupProperties, 'name'>,
    ) => void
}

export const parseLevelDataChart = (entities: LevelDataEntity[]): Chart => {
    const chart: Chart = {
        initialLife: 1000,
        bpms: [],
        groups: new Map(),
        timeScales: [],
        slides: [],
    }

    const groupIds: Record<string, GroupId> = {}

    const ctx: ParseCtx = {
        chart,
        entities,

        getGroupId(entity) {
            const ref = getRef(entity, '#TIMESCALE_GROUP')
            const id = groupIds[ref]
            if (!id) throw new Error(`Invalid level: ref "${ref}" not found`)

            return id
        },
        addGroup(name, editorName, properties) {
            const [id] = addToGroups(chart.groups, editorName, properties)

            if (name) {
                groupIds[name] = id
            }
        },
    }

    parseInitializationToChart(ctx)

    parseBpmsToChart(ctx)
    parseTimeScalesToChart(ctx)

    parseSlidesToChart(ctx)

    while (chart.groups.size < (settings.autoAddGroup ? 2 : 1)) {
        addToGroups(chart.groups)
    }

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
): Static<T> | undefined => {
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
