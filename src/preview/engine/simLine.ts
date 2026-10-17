import type { ZKey } from '../gl'
import type { PreviewSkin, Sprite } from '../skin'
import { LAYER_SIM_LINE, getZ } from './layer'
import {
    DynamicLayout,
    approach,
    perspectiveVec,
    stageTransformToAffineOrIdentity,
    tiltWidthFactor,
    type StageTransform,
} from './layout'
import {
    applyAffine,
    clamp,
    lerp,
    normalizeVecOrZero,
    orthogonalVec,
    subVec,
    unlerp,
    unlerpClamped,
    vec,
    type Quad,
} from './math'

type Draw = (sprite: Sprite | undefined, quad: Quad, z: ZKey, a: number) => void

export const drawSimLine = (
    draw: Draw,
    skin: PreviewSkin,
    leftLane: number,
    leftVisualProgress: number,
    leftTargetTime: number,
    rightLane: number,
    rightVisualProgress: number,
    rightTargetTime: number,
    leftTransform?: StageTransform,
    rightTransform?: StageTransform,
    leftNoteAlpha = 1,
    rightNoteAlpha = 1,
) => {
    if (!skin.simLine) return

    if (
        leftVisualProgress < DynamicLayout.progressStart &&
        rightVisualProgress < DynamicLayout.progressStart
    )
        return
    if (
        leftVisualProgress > DynamicLayout.progressCutoff &&
        rightVisualProgress > DynamicLayout.progressCutoff
    )
        return
    if (
        (leftVisualProgress < 1 && 1 < rightVisualProgress) ||
        (leftVisualProgress > 1 && 1 > rightVisualProgress)
    )
        return

    const adjLeftProgress = clamp(
        leftVisualProgress,
        DynamicLayout.progressStart,
        DynamicLayout.progressCutoff,
    )
    const adjRightProgress = clamp(
        rightVisualProgress,
        DynamicLayout.progressStart,
        DynamicLayout.progressCutoff,
    )

    let adjLeftLane = leftLane
    let adjRightLane = rightLane
    if (Math.abs(leftVisualProgress - rightVisualProgress) > 1e-6) {
        const adjLeftFrac = unlerp(leftVisualProgress, rightVisualProgress, adjLeftProgress)
        const adjRightFrac = unlerp(leftVisualProgress, rightVisualProgress, adjRightProgress)
        adjLeftLane = lerp(leftLane, rightLane, adjLeftFrac)
        adjRightLane = lerp(leftLane, rightLane, adjRightFrac)
    }

    const adjLeftTravel = approach(adjLeftProgress)
    const adjRightTravel = approach(adjRightProgress)
    if (
        Math.abs(adjLeftLane - adjRightLane) < 1e-6 &&
        Math.abs(adjLeftTravel - adjRightTravel) < 1e-6
    )
        return

    const leftAffine = stageTransformToAffineOrIdentity(leftTransform)
    const rightAffine = stageTransformToAffineOrIdentity(rightTransform)

    let ml
    let mr
    let mlTravel
    let mrTravel
    if (adjLeftLane <= adjRightLane) {
        ml = applyAffine(leftAffine, perspectiveVec(adjLeftLane, 1, adjLeftTravel))
        mr = applyAffine(rightAffine, perspectiveVec(adjRightLane, 1, adjRightTravel))
        mlTravel = adjLeftTravel
        mrTravel = adjRightTravel
    } else {
        ml = applyAffine(rightAffine, perspectiveVec(adjRightLane, 1, adjRightTravel))
        mr = applyAffine(leftAffine, perspectiveVec(adjLeftLane, 1, adjLeftTravel))
        mlTravel = adjRightTravel
        mrTravel = adjLeftTravel
    }

    const ort = normalizeVecOrZero(orthogonalVec(subVec(mr, ml)))
    const mlH = DynamicLayout.scaledNoteH * tiltWidthFactor(mlTravel)
    const mrH = DynamicLayout.scaledNoteH * tiltWidthFactor(mrTravel)

    const layout: Quad = {
        bl: vec(ml.x + ort.x * mlH, ml.y + ort.y * mlH),
        br: vec(mr.x + ort.x * mrH, mr.y + ort.y * mrH),
        tl: vec(ml.x - ort.x * mlH, ml.y - ort.y * mlH),
        tr: vec(mr.x - ort.x * mrH, mr.y - ort.y * mrH),
    }

    const progressDiff = Math.abs(leftVisualProgress - rightVisualProgress)
    const fadeAlpha = unlerpClamped(1, 0.5, progressDiff)
    const a = Math.min(leftNoteAlpha, rightNoteAlpha, 1) * fadeAlpha
    if (a <= 0) return

    const z = getZ(
        LAYER_SIM_LINE,
        (leftTargetTime + rightTargetTime) / 2,
        (leftLane + rightLane) / 2,
    )

    draw(skin.simLine, layout, z, a)
}
