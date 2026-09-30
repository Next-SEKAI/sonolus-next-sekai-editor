import type { CameraChange, FlickDirectionValue } from './layout'
import type { EaseTypeValue } from './math'
import type { TimescaleGroup } from './timescale'

export const NoteKind = {
    tap: 0,
    trace: 1,
    traceFlick: 2,
    flick: 3,
    release: 4,
    headTap: 5,
    headFlick: 6,
    headTrace: 7,
    headTraceFlick: 8,
    headRelease: 9,
    tailTap: 10,
    tailFlick: 11,
    tailTrace: 12,
    tailTraceFlick: 13,
    tailRelease: 14,
    tick: 15,
    hideTick: 16,
    damage: 17,
    anchor: 18,
} as const

export type NoteKindValue = (typeof NoteKind)[keyof typeof NoteKind]

export const ConnectorKind = {
    none: 0,
    activeNormal: 1,
    activeCritical: 2,
    damage: 3,
    activeFakeNormal: 51,
    activeFakeCritical: 52,
    fakeDamage: 53,
    guideNeutral: 101,
    guideRed: 102,
    guideGreen: 103,
    guideBlue: 104,
    guideYellow: 105,
    guidePurple: 106,
    guideCyan: 107,
    guideBlack: 108,
} as const

export type ConnectorKindValue = (typeof ConnectorKind)[keyof typeof ConnectorKind]

export const isActiveConnectorKind = (kind: ConnectorKindValue) =>
    kind === ConnectorKind.activeNormal ||
    kind === ConnectorKind.activeCritical ||
    kind === ConnectorKind.activeFakeNormal ||
    kind === ConnectorKind.activeFakeCritical

export type ConnectorLayerValue = 0 | 1 | 2 | 3

export type PreviewNote = {
    kind: NoteKindValue
    isCritical: boolean
    isFake: boolean
    targetTime: number
    lane: number
    size: number
    direction: FlickDirectionValue
    groupIndex: number
    stageIndex: number

    isAttached: boolean
    attachHead?: PreviewNote
    attachTail?: PreviewNote
    connectorEase: EaseTypeValue

    targetScaledTime: number
}

export type PreviewConnector = {
    kind: ConnectorKindValue
    ease: EaseTypeValue
    head: PreviewNote
    tail: PreviewNote
    segmentHead: PreviewNote
    segmentTail: PreviewNote
    activeHead?: PreviewNote
    activeTail?: PreviewNote
    segmentHeadAlpha: number
    segmentTailAlpha: number
    layer: ConnectorLayerValue
    throughJudgeLine: boolean
    fullScreen: boolean
}

export type PreviewSlide = {
    activeHead: PreviewNote
    activeTail: PreviewNote
    kind: ConnectorKindValue
    connectors: PreviewConnector[]
}

export type PreviewSimLine = {
    left: PreviewNote
    right: PreviewNote
}

export type StageMaskEvent = {
    time: number
    lane: number
    size: number
    ease: EaseTypeValue
}

export type StagePivotEvent = {
    time: number
    lane: number
    divisionSize: number
    divisionParity: 0 | 1
    yOffset: number
    ease: EaseTypeValue
}

export type StageStyleEvent = {
    time: number
    judgeLineColor: number
    judgeLineStyle: 0 | 1
    leftBorderStyle: number
    rightBorderStyle: number
    fullWidth: number
    noteAlpha: number
    laneAlpha: number
    judgeLineAlpha: number
    divisionLineAlpha: number
    ease: EaseTypeValue
}

export type StageTransformEvent = {
    time: number
    rotate: number
    xLaneTranslate: number
    yLaneTranslate: number
    centerWeight: number
    ease: EaseTypeValue
}

export type PreviewStage = {
    order: number
    drawStartTime: number
    drawEndTime: number
    masks: StageMaskEvent[]
    pivots: StagePivotEvent[]
    styles: StageStyleEvent[]
    transforms: StageTransformEvent[]
    hasTransforms: boolean
}

export type PreviewChart = {
    isDynamicStages: boolean
    notes: PreviewNote[]
    connectors: PreviewConnector[]
    slides: PreviewSlide[]
    simLines: PreviewSimLine[]
    cameras: CameraChange[]
    groups: TimescaleGroup[]
    stages: PreviewStage[]
    hasStageTransforms: boolean
}
