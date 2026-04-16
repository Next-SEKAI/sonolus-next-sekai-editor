import type { Chart } from '../..'
import { addToGroups } from '../../../state/groups'
import type { UscObject } from '../../../usc/objects/schema'

export const parseUscChart = (objects: UscObject[]) => {
    const chart: Chart = {
        initialLife: 1000,
        bpms: [],
        groups: new Map(),
        timeScales: [],
        slides: [],
    }

    const timeScaleGroups = objects.filter((object) => object.type === 'timeScaleGroup')
    const groupIds = [...Array(Math.max(2, timeScaleGroups.length)).keys()].map(
        () => addToGroups(chart.groups)[0],
    )

    const getGroup = (index: number) => {
        const group = groupIds[index]
        if (!group) throw new Error(`Invalid level: group ${index} not found`)

        return group
    }

    for (const object of objects) {
        switch (object.type) {
            case 'bpm':
                chart.bpms.push({
                    beat: object.beat,
                    bpm: object.bpm,
                })
                break
            case 'timeScaleGroup':
                for (const change of object.changes) {
                    chart.timeScales.push({
                        group: getGroup(timeScaleGroups.indexOf(object)),
                        beat: change.beat,
                        timeScale: change.timeScale,
                        skip: 0,
                        ease: 'none',
                        hideNotes: false,
                    })
                }
                break
            case 'single':
                chart.slides.push([
                    {
                        group: getGroup(object.timeScaleGroup),
                        beat: object.beat,
                        noteType: object.trace ? 'trace' : 'default',
                        isAttached: false,
                        left: object.lane - object.size,
                        size: object.size * 2,
                        isCritical: object.critical,
                        flickDirection: flickDirections[object.direction ?? 'none'],
                        isFake: false,
                        sfx: 'default',
                        isConnectorSeparator: false,
                        connectorType: 'active',
                        connectorEase: 'linear',
                        connectorActiveIsCritical: object.critical,
                        connectorActiveIsFake: false,
                        connectorGuideColor: 'green',
                        connectorGuideAlpha: 1,
                        connectorLayer: 'top',
                    },
                ])
                break
            case 'slide':
                chart.slides.push(
                    object.connections.map((connection) => ({
                        group: getGroup(connection.timeScaleGroup ?? 0),
                        beat: connection.beat,
                        noteType:
                            connection.type === 'start' || connection.type === 'end'
                                ? noteTypes[connection.judgeType]
                                : connection.critical === undefined
                                  ? 'anchor'
                                  : 'default',
                        isAttached: connection.type === 'attach',
                        left: connection.type === 'attach' ? 0 : connection.lane - connection.size,
                        size: connection.type === 'attach' ? 0 : connection.size * 2,
                        isCritical: connection.critical ?? object.critical,
                        flickDirection:
                            connection.type === 'end'
                                ? flickDirections[connection.direction ?? 'none']
                                : 'none',
                        isFake: false,
                        sfx: 'default',
                        isConnectorSeparator: false,
                        connectorType: 'active',
                        connectorEase:
                            connection.type === 'start' || connection.type === 'tick'
                                ? connectorEases[connection.ease]
                                : 'linear',
                        connectorActiveIsCritical: object.critical,
                        connectorActiveIsFake: false,
                        connectorGuideColor: 'green',
                        connectorGuideAlpha: 1,
                        connectorLayer: 'top',
                    })),
                )
                break
            case 'guide':
                chart.slides.push(
                    object.midpoints.map((midpoint, i) => ({
                        group: getGroup(midpoint.timeScaleGroup),
                        beat: midpoint.beat,
                        noteType: 'anchor',
                        isAttached: false,
                        left: midpoint.lane - midpoint.size,
                        size: midpoint.size * 2,
                        isCritical: false,
                        flickDirection: 'none',
                        isFake: false,
                        sfx: 'default',
                        isConnectorSeparator: false,
                        connectorType: 'guide',
                        connectorEase: connectorEases[midpoint.ease],
                        connectorActiveIsCritical: false,
                        connectorActiveIsFake: false,
                        connectorGuideColor: object.color,
                        connectorGuideAlpha: (i === 0
                            ? connectorGuideAlphaStarts
                            : connectorGuideAlphaEnds)[object.fade],
                        connectorLayer: 'top',
                    })),
                )
                break
            case 'damage':
                chart.slides.push([
                    {
                        group: getGroup(object.timeScaleGroup),
                        beat: object.beat,
                        noteType: 'damage',
                        isAttached: false,
                        left: object.lane - object.size,
                        size: object.size * 2,
                        isCritical: false,
                        flickDirection: 'none',
                        isFake: false,
                        sfx: 'default',
                        isConnectorSeparator: false,
                        connectorType: 'active',
                        connectorEase: 'linear',
                        connectorActiveIsCritical: false,
                        connectorActiveIsFake: false,
                        connectorGuideColor: 'green',
                        connectorGuideAlpha: 1,
                        connectorLayer: 'top',
                    },
                ])
                break
        }
    }

    return chart
}

const noteTypes = {
    trace: 'trace',
    none: 'anchor',
    normal: 'default',
} as const

const flickDirections = {
    up: 'up',
    left: 'upLeft',
    right: 'upRight',
    none: 'none',
} as const

const connectorEases = {
    out: 'out',
    linear: 'linear',
    in: 'in',
    inout: 'inOut',
    outin: 'outIn',
} as const

const connectorGuideAlphaStarts = {
    none: 1,
    out: 1,
    in: 0,
} as const

const connectorGuideAlphaEnds = {
    none: 1,
    out: 0,
    in: 1,
} as const
