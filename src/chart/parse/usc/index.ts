import type { Chart } from '../..'
import type { UscObject } from '../../../usc/objects/schema'

export const parseUscChart = (objects: UscObject[]) => {
    const chart: Chart = {
        bpms: [],
        groupCount: 2,
        timeScales: [],
        slides: [],
    }

    let group = -1
    for (const object of objects) {
        switch (object.type) {
            case 'bpm':
                chart.bpms.push({
                    beat: object.beat,
                    bpm: object.bpm,
                })
                break
            case 'timeScaleGroup':
                group++
                for (const change of object.changes) {
                    chart.timeScales.push({
                        group,
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
                        group: object.timeScaleGroup,
                        beat: object.beat,
                        noteType: object.trace ? 'trace' : 'default',
                        isAttached: false,
                        left: object.lane - object.size,
                        size: object.size * 2,
                        isCritical: object.critical,
                        flickDirection: flickDirections[object.direction ?? 'none'],
                        isFake: false,
                        isConnectorSeparator: false,
                        connectorType: 'active',
                        connectorEase: 'linear',
                        connectorActiveIsCritical: object.critical,
                        connectorActiveIsFake: false,
                        connectorGuideColor: 'green',
                        connectorGuideAlpha: 1,
                    },
                ])
                break
            case 'slide':
                chart.slides.push(
                    object.connections.map((connection) => ({
                        group: connection.timeScaleGroup ?? 0,
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
                    })),
                )
                break
            case 'guide':
                chart.slides.push(
                    object.midpoints.map((midpoint, i) => ({
                        group: midpoint.timeScaleGroup,
                        beat: midpoint.beat,
                        noteType: 'anchor',
                        isAttached: false,
                        left: midpoint.lane - midpoint.size,
                        size: midpoint.size * 2,
                        isCritical: false,
                        flickDirection: 'none',
                        isFake: false,
                        isConnectorSeparator: false,
                        connectorType: 'guide',
                        connectorEase: connectorEases[midpoint.ease],
                        connectorActiveIsCritical: false,
                        connectorActiveIsFake: false,
                        connectorGuideColor: object.color,
                        connectorGuideAlpha: (i === 0
                            ? connectorGuideAlphaStarts
                            : connectorGuideAlphaEnds)[object.fade],
                    })),
                )
                break
            case 'damage':
                chart.slides.push([
                    {
                        group: object.timeScaleGroup,
                        beat: object.beat,
                        noteType: 'damage',
                        isAttached: false,
                        left: object.lane - object.size,
                        size: object.size * 2,
                        isCritical: false,
                        flickDirection: 'none',
                        isFake: false,
                        isConnectorSeparator: false,
                        connectorType: 'active',
                        connectorEase: 'linear',
                        connectorActiveIsCritical: false,
                        connectorActiveIsFake: false,
                        connectorGuideColor: 'green',
                        connectorGuideAlpha: 1,
                    },
                ])
                break
        }
    }

    chart.groupCount += Math.max(0, group)

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
