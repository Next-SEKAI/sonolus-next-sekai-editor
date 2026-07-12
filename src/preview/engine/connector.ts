import type { ZKey } from '../gl'
import type { PreviewSkin, Sprite } from '../skin'
import {
    LAYER_ACTIVE_SLIDE_CONNECTOR_BOTTOM,
    LAYER_ACTIVE_SLIDE_CONNECTOR_OVER,
    LAYER_ACTIVE_SLIDE_CONNECTOR_TOP,
    LAYER_ACTIVE_SLIDE_CONNECTOR_UNDER,
    LAYER_GUIDE_CONNECTOR_BOTTOM,
    LAYER_GUIDE_CONNECTOR_OVER,
    LAYER_GUIDE_CONNECTOR_TOP,
    LAYER_GUIDE_CONNECTOR_UNDER,
    getZ,
} from './layer'
import {
    DynamicLayout,
    Layout,
    approach,
    blendStageTransform,
    perspectiveVec,
    stageTransformIsIdentity,
    stageTransformToAffine,
    type StageTransform,
} from './layout'
import {
    applyAffine,
    clamp,
    ease,
    easeOutCubic,
    lerp,
    remapClamped,
    unlerpClamped,
    vec,
    type EaseTypeValue,
    type Quad,
    type Vec,
} from './math'
import {
    ConnectorKind,
    isActiveConnectorKind,
    type ConnectorKindValue,
    type ConnectorLayerValue,
} from './model'

type Draw = (sprite: Sprite | undefined, quad: Quad, z: ZKey, a: number) => void

const SLIDE_ALPHA = 1
const GUIDE_ALPHA = 0.6

export const ConnectorVisualState = {
    waiting: 0,
    inactive: 1,
    active: 2,
} as const

export type ConnectorVisualStateValue =
    (typeof ConnectorVisualState)[keyof typeof ConnectorVisualState]

const getConnectorSprites = (skin: PreviewSkin, kind: ConnectorKindValue) => {
    if (kind === ConnectorKind.activeNormal || kind === ConnectorKind.activeFakeNormal) {
        return skin.activeSlideConnector
    }
    if (kind === ConnectorKind.activeCritical || kind === ConnectorKind.activeFakeCritical) {
        return skin.criticalActiveSlideConnector
    }
    if (kind === ConnectorKind.damage) return skin.damageSlideConnector
    if (kind === ConnectorKind.fakeDamage) {
        return { normal: skin.damageSlideConnector.normal, active: undefined }
    }
    return { normal: skin.guides[kind - ConnectorKind.guideNeutral], active: undefined }
}

const getConnectorLayer = (kind: ConnectorKindValue, layer: ConnectorLayerValue) => {
    if (isActiveConnectorKind(kind)) {
        switch (layer) {
            case 0:
                return LAYER_ACTIVE_SLIDE_CONNECTOR_TOP
            case 1:
                return LAYER_ACTIVE_SLIDE_CONNECTOR_BOTTOM
            case 2:
                return LAYER_ACTIVE_SLIDE_CONNECTOR_UNDER
            case 3:
                return LAYER_ACTIVE_SLIDE_CONNECTOR_OVER
        }
    }
    switch (layer) {
        case 0:
            return LAYER_GUIDE_CONNECTOR_TOP
        case 1:
            return LAYER_GUIDE_CONNECTOR_BOTTOM
        case 2:
            return LAYER_GUIDE_CONNECTOR_UNDER
        case 3:
            return LAYER_GUIDE_CONNECTOR_OVER
    }
}

const getConnectorZ = (
    kind: ConnectorKindValue,
    targetTime: number,
    lane: number,
    active: boolean,
    layer: ConnectorLayerValue,
): ZKey => {
    const layerValue = getConnectorLayer(kind, layer)
    let etc
    if (kind === ConnectorKind.activeNormal || kind === ConnectorKind.activeFakeNormal) {
        etc = 3 - (active ? 1 : 0)
    } else if (kind === ConnectorKind.activeCritical || kind === ConnectorKind.activeFakeCritical) {
        etc = 1 - (active ? 1 : 0)
    } else if (kind === ConnectorKind.damage || kind === ConnectorKind.fakeDamage) {
        etc = 9 - (active ? 1 : 0)
    } else {
        etc = kind - ConnectorKind.guideNeutral
    }
    return getZ(layerValue, targetTime, lane, etc, true)
}

const getConnectorAlphaOption = (kind: ConnectorKindValue) =>
    isActiveConnectorKind(kind) ||
    kind === ConnectorKind.damage ||
    kind === ConnectorKind.fakeDamage
        ? SLIDE_ALPHA
        : kind === ConnectorKind.none
          ? 0
          : GUIDE_ALPHA

export type ConnectorEndpoint = {
    lane: number
    size: number
    visualProgress: number
    targetTime: number
    easeFrac: number
    transform?: StageTransform
}

export const drawConnector = (
    draw: Draw,
    skin: PreviewSkin,
    now: number,
    kind: ConnectorKindValue,
    visualState: ConnectorVisualStateValue,
    easeType: EaseTypeValue,
    head: ConnectorEndpoint,
    tail: ConnectorEndpoint,
    segmentHeadTargetTime: number,
    segmentHeadLane: number,
    segmentHeadAlpha: number,
    segmentTailTargetTime: number,
    segmentTailAlpha: number,
    headNoteAlpha: number,
    tailNoteAlpha: number,
    layer: ConnectorLayerValue,
    fullScreen: boolean,
    bypassTailTargetTimeCheck = false,
) => {
    if (kind === ConnectorKind.none) return

    if (headNoteAlpha <= 0 && tailNoteAlpha <= 0) return

    if (fullScreen) {
        if (
            head.targetTime === tail.targetTime ||
            now < Math.min(head.targetTime, tail.targetTime) ||
            now > Math.max(head.targetTime, tail.targetTime)
        )
            return
    } else {
        if (
            (head.visualProgress < DynamicLayout.progressStart &&
                tail.visualProgress < DynamicLayout.progressStart) ||
            (head.visualProgress > DynamicLayout.progressCutoff &&
                tail.visualProgress > DynamicLayout.progressCutoff) ||
            head.visualProgress === tail.visualProgress
        )
            return
    }

    let tailLane = tail.lane
    let tailSize = tail.size
    if (easeType === 0) {
        tailLane = head.lane
        tailSize = head.size
    }

    const sprites = getConnectorSprites(skin, kind)
    if (!sprites.normal) return

    if (isActiveConnectorKind(kind)) {
        segmentHeadAlpha = 1
        segmentTailAlpha = 1
        if (
            (kind === ConnectorKind.activeFakeNormal ||
                kind === ConnectorKind.activeFakeCritical) &&
            visualState === ConnectorVisualState.inactive
        ) {
            visualState = ConnectorVisualState.active
        }
    } else if (kind !== ConnectorKind.damage) {
        visualState = ConnectorVisualState.waiting
    }

    const headAlpha =
        remapClamped(
            segmentHeadTargetTime,
            segmentTailTargetTime,
            segmentHeadAlpha,
            segmentTailAlpha,
            head.targetTime,
        ) * headNoteAlpha
    const tailAlpha =
        remapClamped(
            segmentHeadTargetTime,
            segmentTailTargetTime,
            segmentHeadAlpha,
            segmentTailAlpha,
            tail.targetTime,
        ) * tailNoteAlpha

    if (now >= tail.targetTime && !bypassTailTargetTimeCheck) return

    const zNormal = getConnectorZ(kind, segmentHeadTargetTime, segmentHeadLane, false, layer)
    const zActive =
        visualState === ConnectorVisualState.active && sprites.active
            ? getConnectorZ(kind, segmentHeadTargetTime, segmentHeadLane, true, layer)
            : zNormal

    const drawQuad = (layout: Quad, baseA: number) => {
        if (visualState === ConnectorVisualState.active && sprites.active) {
            const aModifier = (Math.cos(2 * Math.PI * now) + 1) / 2
            draw(sprites.normal, layout, zNormal, baseA * easeOutCubic(aModifier))
            draw(sprites.active, layout, zActive, baseA * easeOutCubic(1 - aModifier))
        } else {
            draw(
                sprites.normal,
                layout,
                zNormal,
                baseA * (visualState === ConnectorVisualState.inactive ? 0.5 : 1),
            )
        }
    }

    if (fullScreen) {
        const judgeFrac = unlerpClamped(head.targetTime, tail.targetTime, now)
        const judgeAlpha = lerp(headAlpha, tailAlpha, judgeFrac)
        const baseA = clamp(judgeAlpha * getConnectorAlphaOption(kind), 0, 1)
        const w = Layout.screenW / 2
        const h = Layout.screenH / 2
        drawQuad(
            {
                bl: vec(-w, -h),
                tl: vec(-w, h),
                tr: vec(w, h),
                br: vec(w, -h),
            },
            baseA,
        )
        return
    }

    const startVisualProgress = clamp(
        head.visualProgress,
        DynamicLayout.progressStart,
        DynamicLayout.progressCutoff,
    )
    const endVisualProgress = clamp(
        tail.visualProgress,
        DynamicLayout.progressStart,
        DynamicLayout.progressCutoff,
    )
    const startFrac = unlerpClamped(head.visualProgress, tail.visualProgress, startVisualProgress)
    const endFrac = unlerpClamped(head.visualProgress, tail.visualProgress, endVisualProgress)
    const startEaseFrac = lerp(head.easeFrac, tail.easeFrac, startFrac)
    const endEaseFrac = lerp(head.easeFrac, tail.easeFrac, endFrac)
    const easedHeadEaseFrac = ease(easeType, head.easeFrac)
    const easedTailEaseFrac = ease(easeType, tail.easeFrac)

    const alphaOption = getConnectorAlphaOption(kind)

    const headTransform = head.transform
    const tailTransform = tail.transform
    const hasTransform =
        !!headTransform &&
        !!tailTransform &&
        !(stageTransformIsIdentity(headTransform) && stageTransformIsIdentity(tailTransform))

    const sampleAt = (s: number): ConnectorSample => {
        const easeFrac = lerp(startEaseFrac, endEaseFrac, s)
        const interpFrac = unlerpClamped(
            easedHeadEaseFrac,
            easedTailEaseFrac,
            ease(easeType, easeFrac),
        )
        const visualProgress = lerp(startVisualProgress, endVisualProgress, s)
        const travel = approach(visualProgress)
        const lane = lerp(head.lane, tailLane, interpFrac)
        const size = Math.max(1e-3, lerp(head.size, tailSize, interpFrac))

        let left = perspectiveVec(lane - size, 1, travel)
        let right = perspectiveVec(lane + size, 1, travel)
        if (hasTransform) {
            const affine = stageTransformToAffine(
                blendStageTransform(headTransform, tailTransform, interpFrac),
            )
            left = applyAffine(affine, left)
            right = applyAffine(affine, right)
        }

        return {
            s,
            travel,
            left,
            right,
            alpha: lerp(headAlpha, tailAlpha, lerp(startFrac, endFrac, s)),
        }
    }

    const emit = (a: ConnectorSample, b: ConnectorSample) => {
        const baseA = clamp(((a.alpha + b.alpha) / 2) * alphaOption, 0, 1)

        const layout: Quad =
            a.travel >= b.travel
                ? { bl: a.left, br: a.right, tl: b.left, tr: b.right }
                : { bl: b.left, br: b.right, tl: a.left, tr: a.right }

        drawQuad(layout, baseA)
    }

    const flatten = (a: ConnectorSample, b: ConnectorSample, depth: number) => {
        const p1 = sampleAt(lerp(a.s, b.s, 0.25))
        const p2 = sampleAt(lerp(a.s, b.s, 0.75))

        const flat =
            chordError(a.left, b.left, p1.left, 0.25) <= FLATTEN_EPS &&
            chordError(a.left, b.left, p2.left, 0.75) <= FLATTEN_EPS &&
            chordError(a.right, b.right, p1.right, 0.25) <= FLATTEN_EPS &&
            chordError(a.right, b.right, p2.right, 0.75) <= FLATTEN_EPS &&
            Math.abs(p1.alpha - lerp(a.alpha, b.alpha, 0.25)) * alphaOption <= FLATTEN_ALPHA_EPS &&
            Math.abs(p2.alpha - lerp(a.alpha, b.alpha, 0.75)) * alphaOption <= FLATTEN_ALPHA_EPS

        if (!flat && depth < MAX_FLATTEN_DEPTH) {
            const mid = sampleAt((a.s + b.s) / 2)
            flatten(a, mid, depth + 1)
            flatten(mid, b, depth + 1)
        } else {
            emit(a, b)
        }
    }

    flatten(sampleAt(0), sampleAt(1), 0)
}

type ConnectorSample = {
    s: number
    travel: number
    left: Vec
    right: Vec
    alpha: number
}

const FLATTEN_EPS = 0.001
const FLATTEN_ALPHA_EPS = 0.02
const MAX_FLATTEN_DEPTH = 8

const chordError = (a: Vec, b: Vec, p: Vec, t: number) =>
    Math.hypot(p.x - lerp(a.x, b.x, t), p.y - lerp(a.y, b.y, t))
