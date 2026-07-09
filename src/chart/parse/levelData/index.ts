import { type LevelDataEntity } from '@sonolus/core'
import Type from 'typebox'
import Value from 'typebox/value'
import type { Chart } from '../..'
import { settings } from '../../../settings'
import { addToGroups, type GroupId, type GroupObject } from '../../groups'
import { addDefaultStageToStages, addToStages, type StageId, type StageObject } from '../../stages'
import { parseBpmsToChart } from './bpm'
import { parseCameraEventsToChart } from './events/camera'
import { parseStageMaskEventsToChart } from './events/stage/mask'
import { parseStagePivotEventsToChart } from './events/stage/pivot'
import { parseStageStyleEventsToChart } from './events/stage/style'
import { parseStageTransformEventsToChart } from './events/stage/transform'
import { parseGroupsToChart } from './group'
import { parseInitializationToChart } from './initialization'
import { parseSlidesToChart } from './slide'
import { parseStagesToChart } from './stage'
import { parseTimeScalesToChart } from './timeScale'

export type ParseCtx = {
    chart: Chart
    entities: LevelDataEntity[]

    getGroupId: (entity: LevelDataEntity) => GroupId
    addGroup: (
        name: string | undefined,
        editorName: string | undefined,
        object: Omit<GroupObject, 'name'>,
    ) => void

    getStageId: (entity: LevelDataEntity) => StageId
    addStage: (
        name: string | undefined,
        editorName: string | undefined,
        object: Omit<StageObject, 'name'>,
    ) => StageId
}

export const parseLevelDataChart = (entities: LevelDataEntity[]): Chart => {
    const chart: Chart = {
        initialLife: 1000,
        isDynamicStages: false,
        bpms: [],
        groups: new Map(),
        stages: new Map(),
        cameraEvents: [],
        stageMaskEvents: [],
        stagePivotEvents: [],
        stageStyleEvents: [],
        stageTransformEvents: [],
        timeScales: [],
        slides: [],
    }

    const groupIds: Record<string, GroupId> = {}
    const stageIds: Record<string, StageId> = {}
    let defaultStageId: StageId

    const ctx: ParseCtx = {
        chart,
        entities,

        getGroupId(entity) {
            const ref = getRef(entity, '#TIMESCALE_GROUP')
            const id = groupIds[ref]
            if (!id) throw new Error(`Invalid level: ref "${ref}" not found`)

            return id
        },
        addGroup(name, editorName, object) {
            const [id] = addToGroups(chart.groups, editorName, object)

            if (name) {
                groupIds[name] = id
            }
        },

        getStageId(entity) {
            const ref = getOptionalRef(entity, 'stage')
            if (chart.isDynamicStages) {
                if (ref === undefined) throw new Error(`Invalid level: data stage not found`)

                const id = stageIds[ref]
                if (!id) throw new Error(`Invalid level: ref "${ref}" not found`)

                return id
            } else {
                if (ref !== undefined) throw new Error(`Invalid level: ref "${ref}" not found`)

                return defaultStageId
            }
        },
        addStage(name, editorName, object) {
            chart.isDynamicStages = true
            const [id] = addToStages(chart.stages, editorName, object)

            if (name) {
                stageIds[name] = id
            }

            return id
        },
    }

    const firstCameraRef = parseInitializationToChart(ctx)

    parseBpmsToChart(ctx)

    parseGroupsToChart(ctx)
    while (chart.groups.size < (settings.autoAddGroup ? 2 : 1)) {
        addToGroups(chart.groups)
    }

    const { firstMaskRefs, firstPivotRefs, firstStyleRefs, firstTransformRefs } =
        parseStagesToChart(ctx)
    if (!chart.stages.size) {
        ;[defaultStageId] = addDefaultStageToStages(chart.stages)
    }

    parseCameraEventsToChart(ctx, firstCameraRef)

    parseStageMaskEventsToChart(ctx, firstMaskRefs)
    parseStagePivotEventsToChart(ctx, firstPivotRefs)
    parseStageStyleEventsToChart(ctx, firstStyleRefs)
    parseStageTransformEventsToChart(ctx, firstTransformRefs)

    parseTimeScalesToChart(ctx)

    parseSlidesToChart(ctx)

    return chart
}

export const getValue = <T extends Type.TSchema>(
    entity: LevelDataEntity,
    name: string,
    schema: T,
) => {
    const data = entity.data.find((data) => data.name === name)
    if (!data) throw new Error(`Invalid level: data ${name} not found`)
    if (!('value' in data)) throw new Error(`Invalid level: data ${name} has no value`)

    Value.Assert(schema, data.value)
    return data.value
}

export const getOptionalValue = <T extends Type.TSchema>(
    entity: LevelDataEntity,
    name: string,
    schema: T,
) => {
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
