import type { ZKey } from '../gl'
import type { JudgmentSpriteSet, PreviewSkin, Sprite } from '../skin'
import { LAYER_STAGE, getZ, getZAlt } from './layer'
import {
    DynamicLayout,
    approach,
    computeStageTransform,
    currentLayoutTransform,
    identityStageTransform,
    layoutSekaiStage,
    layoutStageLaneByEdges,
    perspectiveRect,
    stageTransformToAffine,
    tiltDepth,
    tiltWidenedEdge,
    tiltWidthFactor,
    transformedVecAt,
    type StageTransform,
} from './layout'
import {
    clamp,
    ease,
    identityAffineTransform,
    lerp,
    rotateVec,
    transformQuadAffine,
    unlerp,
    vec,
    type AffineTransform,
    type Quad,
    type Vec,
} from './math'
import type { PreviewStage } from './model'

export type Transition<T> = {
    start: T
    end: T
    progress: number
}

export type StageProps = {
    lane: number
    width: number
    pivotLane: number
    division: Transition<{ size: number; parity: number }>
    judgeLineColor: Transition<number>
    judgeLineStyle: Transition<number>
    leftBorderStyle: Transition<number>
    rightBorderStyle: Transition<number>
    order: number
    noteAlpha: number
    laneAlpha: number
    judgeLineAlpha: number
    yOffset: number
    fullWidth: number
    divisionLineAlpha: number
    rotate: number
    xLaneTranslate: number
    yLaneTranslate: number
    centerWeight: number
}

const FULL_WIDTH_HALF_EXTENT = 48
const JUDGE_LINE_BORDER_FACTOR = 5

type Draw = (sprite: Sprite | undefined, quad: Quad, z: ZKey, a: number) => void

const snapDividerEdgeToScreenPixels = (a: Vec, b: Vec): [Vec, Vec] => {
    const dx = b.x - a.x
    const dy = b.y - a.y
    const width = Math.hypot(dx, dy)
    const pixelSize = DynamicLayout.screenPixelSize
    if (width <= 0 || pixelSize <= 0) return [a, b]

    const snappedWidth = Math.max(1, Math.round(width / pixelSize)) * pixelSize
    const halfScale = snappedWidth / width / 2
    const mx = (a.x + b.x) / 2
    const my = (a.y + b.y) / 2

    return [
        vec(mx - dx * halfScale, my - dy * halfScale),
        vec(mx + dx * halfScale, my + dy * halfScale),
    ]
}

const snapDividerThicknessToScreenPixels = (quad: Quad): Quad => {
    const [bl, br] = snapDividerEdgeToScreenPixels(quad.bl, quad.br)
    const [tl, tr] = snapDividerEdgeToScreenPixels(quad.tl, quad.tr)
    return { bl, tl, tr, br }
}

const findEvent = (events: { time: number }[], t: number, leftLimit: boolean) => {
    let lo = 0
    let hi = events.length - 1
    let result = -1
    while (lo <= hi) {
        const mid = (lo + hi) >> 1
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const time = events[mid]!.time
        if (leftLimit ? time < t : time <= t) {
            result = mid
            lo = mid + 1
        } else {
            hi = mid - 1
        }
    }
    return result
}

const queryEvents = <T extends { time: number }>(
    events: T[],
    t: number,
    leftLimit: boolean,
): [T | undefined, T | undefined, number] => {
    const index = findEvent(events, t, leftLimit)
    const a = events[index]
    const b = events[index + 1]

    if (!a) return [undefined, b, 0]
    if (!b || b.time <= a.time) return [a, undefined, 0]

    return [a, b, clamp(unlerp(a.time, b.time, t), 0, 1)]
}

export const getStageProps = (stage: PreviewStage, t: number, leftLimit = false): StageProps => {
    const props: StageProps = {
        lane: 0,
        width: 0,
        pivotLane: 0,
        division: { start: { size: 0, parity: 0 }, end: { size: 0, parity: 0 }, progress: 0 },
        judgeLineColor: { start: 0, end: 0, progress: 0 },
        judgeLineStyle: { start: 0, end: 0, progress: 0 },
        leftBorderStyle: { start: 0, end: 0, progress: 0 },
        rightBorderStyle: { start: 0, end: 0, progress: 0 },
        order: stage.order,
        noteAlpha: 1,
        laneAlpha: 0,
        judgeLineAlpha: 0,
        yOffset: 0,
        fullWidth: 0,
        divisionLineAlpha: 0,
        rotate: 0,
        xLaneTranslate: 0,
        yLaneTranslate: 0,
        centerWeight: 0,
    }

    const [maskA, maskB, maskFrac] = queryEvents(stage.masks, t, leftLimit)
    if (maskA) {
        props.lane = maskA.lane
        props.width = maskA.size
        if (maskB) {
            const p = ease(maskA.ease, maskFrac)
            props.lane = lerp(maskA.lane, maskB.lane, p)
            props.width = lerp(maskA.size, maskB.size, p)
        }
    } else if (maskB) {
        props.lane = maskB.lane
        props.width = maskB.size
    }

    const [pivotA, pivotB, pivotFrac] = queryEvents(stage.pivots, t, leftLimit)
    if (pivotA) {
        props.pivotLane = pivotA.lane
        props.division.start = {
            size: Math.trunc(pivotA.divisionSize),
            parity: pivotA.divisionParity,
        }
        props.division.end = props.division.start
        props.yOffset = pivotA.yOffset
        if (pivotB) {
            const p = ease(pivotA.ease, pivotFrac)
            props.pivotLane = lerp(pivotA.lane, pivotB.lane, p)
            props.division.end = {
                size: Math.trunc(pivotB.divisionSize),
                parity: pivotB.divisionParity,
            }
            props.division.progress = p
            props.yOffset = lerp(pivotA.yOffset, pivotB.yOffset, p)
        }
    } else if (pivotB) {
        props.pivotLane = pivotB.lane
        props.division.start = {
            size: Math.trunc(pivotB.divisionSize),
            parity: pivotB.divisionParity,
        }
        props.division.end = props.division.start
        props.yOffset = pivotB.yOffset
    }

    const [styleA, styleB, styleFrac] = queryEvents(stage.styles, t, leftLimit)
    if (styleA) {
        props.judgeLineColor = {
            start: styleA.judgeLineColor,
            end: styleA.judgeLineColor,
            progress: 0,
        }
        props.judgeLineStyle = {
            start: styleA.judgeLineStyle,
            end: styleA.judgeLineStyle,
            progress: 0,
        }
        props.leftBorderStyle = {
            start: styleA.leftBorderStyle,
            end: styleA.leftBorderStyle,
            progress: 0,
        }
        props.rightBorderStyle = {
            start: styleA.rightBorderStyle,
            end: styleA.rightBorderStyle,
            progress: 0,
        }
        props.noteAlpha = styleA.noteAlpha
        props.laneAlpha = styleA.laneAlpha
        props.judgeLineAlpha = styleA.judgeLineAlpha
        props.fullWidth = styleA.fullWidth
        props.divisionLineAlpha = styleA.divisionLineAlpha
        if (styleB) {
            const p = ease(styleA.ease, styleFrac)
            props.judgeLineColor.end = styleB.judgeLineColor
            props.judgeLineColor.progress = p
            props.judgeLineStyle.end = styleB.judgeLineStyle
            props.judgeLineStyle.progress = p
            props.leftBorderStyle.end = styleB.leftBorderStyle
            props.leftBorderStyle.progress = p
            props.rightBorderStyle.end = styleB.rightBorderStyle
            props.rightBorderStyle.progress = p
            props.noteAlpha = lerp(styleA.noteAlpha, styleB.noteAlpha, p)
            props.laneAlpha = lerp(styleA.laneAlpha, styleB.laneAlpha, p)
            props.judgeLineAlpha = lerp(styleA.judgeLineAlpha, styleB.judgeLineAlpha, p)
            props.fullWidth = lerp(styleA.fullWidth, styleB.fullWidth, p)
            props.divisionLineAlpha = lerp(styleA.divisionLineAlpha, styleB.divisionLineAlpha, p)
        }
    } else if (styleB) {
        props.judgeLineColor = {
            start: styleB.judgeLineColor,
            end: styleB.judgeLineColor,
            progress: 0,
        }
        props.judgeLineStyle = {
            start: styleB.judgeLineStyle,
            end: styleB.judgeLineStyle,
            progress: 0,
        }
        props.leftBorderStyle = {
            start: styleB.leftBorderStyle,
            end: styleB.leftBorderStyle,
            progress: 0,
        }
        props.rightBorderStyle = {
            start: styleB.rightBorderStyle,
            end: styleB.rightBorderStyle,
            progress: 0,
        }
        props.noteAlpha = styleB.noteAlpha
        props.laneAlpha = styleB.laneAlpha
        props.judgeLineAlpha = styleB.judgeLineAlpha
        props.fullWidth = styleB.fullWidth
        props.divisionLineAlpha = styleB.divisionLineAlpha
    }

    const [transformA, transformB, transformFrac] = queryEvents(stage.transforms, t, leftLimit)
    if (transformA) {
        props.rotate = transformA.rotate
        props.xLaneTranslate = transformA.xLaneTranslate
        props.yLaneTranslate = transformA.yLaneTranslate
        props.centerWeight = transformA.centerWeight
        if (transformB) {
            const p = ease(transformA.ease, transformFrac)
            props.rotate = lerp(transformA.rotate, transformB.rotate, p)
            props.xLaneTranslate = lerp(transformA.xLaneTranslate, transformB.xLaneTranslate, p)
            props.yLaneTranslate = lerp(transformA.yLaneTranslate, transformB.yLaneTranslate, p)
            props.centerWeight = lerp(transformA.centerWeight, transformB.centerWeight, p)
        }
    } else if (transformB) {
        props.rotate = transformB.rotate
        props.xLaneTranslate = transformB.xLaneTranslate
        props.yLaneTranslate = transformB.yLaneTranslate
        props.centerWeight = transformB.centerWeight
    }

    return props
}

export const stagePropsHasTransform = (props: StageProps) =>
    props.rotate !== 0 ||
    props.xLaneTranslate !== 0 ||
    props.yLaneTranslate !== 0 ||
    props.centerWeight !== 0

export const stagePropsTransform = (props: StageProps): StageTransform =>
    stagePropsHasTransform(props)
        ? computeStageTransform(
              currentLayoutTransform(),
              props.rotate,
              props.xLaneTranslate,
              props.yLaneTranslate,
              props.lane,
              props.centerWeight,
          )
        : identityStageTransform

const transitionWeight = (transition: Transition<number>, target: number) => {
    let weight = 0
    if (transition.start === target) weight += 1 - transition.progress
    if (transition.end === target) weight += transition.progress
    return weight
}

export const resolveJudgeLineStyle = (style: Transition<number>) =>
    style.progress < 0.5 ? style.start : style.end

export const drawStaticStage = (draw: Draw, skin: PreviewSkin) => {
    if (skin.sekaiStage) {
        draw(skin.sekaiStage, layoutSekaiStage(), getZ(LAYER_STAGE), 1)
        return
    }

    drawDynamicStage(draw, skin, {
        lane: 0,
        width: 6,
        pivotLane: 0,
        division: { start: { size: 2, parity: 0 }, end: { size: 2, parity: 0 }, progress: 0 },
        judgeLineColor: { start: 5, end: 5, progress: 0 },
        judgeLineStyle: { start: 0, end: 0, progress: 0 },
        leftBorderStyle: { start: 0, end: 0, progress: 0 },
        rightBorderStyle: { start: 0, end: 0, progress: 0 },
        order: 0,
        noteAlpha: 1,
        laneAlpha: 1,
        judgeLineAlpha: 1,
        yOffset: 0,
        fullWidth: 0,
        divisionLineAlpha: 1,
        rotate: 0,
        xLaneTranslate: 0,
        yLaneTranslate: 0,
        centerWeight: 0,
    })
}

export const drawStageWithProps = (draw: Draw, skin: PreviewSkin, props: StageProps) => {
    const transform = stagePropsHasTransform(props)
        ? stageTransformToAffine(stagePropsTransform(props))
        : identityAffineTransform

    drawDynamicStage(draw, skin, props, transform)
}

export const drawDynamicStage = (
    draw: Draw,
    skin: PreviewSkin,
    props: StageProps,
    transform: AffineTransform = identityAffineTransform,
) => {
    const {
        lane,
        width,
        pivotLane,
        division,
        judgeLineColor,
        judgeLineStyle,
        leftBorderStyle,
        rightBorderStyle,
        order,
        laneAlpha,
        judgeLineAlpha,
        yOffset,
    } = props

    const place = (q: Quad) => transformQuadAffine(transform, q)

    const spritesSame = judgeLineColor.start === judgeLineColor.end
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const spritesA = skin.judgments[judgeLineColor.start] ?? skin.judgments[0]!
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const spritesB = skin.judgments[judgeLineColor.end] ?? skin.judgments[0]!
    const pSprites = judgeLineColor.progress

    const wDefault = transitionWeight(judgeLineStyle, 0)
    const wSingleLine = transitionWeight(judgeLineStyle, 1)
    const fw = clamp(props.fullWidth, 0, 1)

    if (!skin.laneBackground) {
        drawFallbackStage(draw, skin, props, transform)
        return
    }

    const travel = approach(1 - yOffset)
    const nh = DynamicLayout.noteH
    const l = lane - width
    const r = lane + width
    const halfJl = lerp(width, FULL_WIDTH_HALF_EXTENT, fw)
    const lJl = lane - halfJl
    const rJl = lane + halfJl

    const z = (sub: number) => getZAlt(LAYER_STAGE, order * 17 + sub)

    const f = JUDGE_LINE_BORDER_FACTOR

    const drawLeftBorder = (style: number, zKey: ZKey, alpha: number) => {
        switch (style) {
            case 0:
            case 3: {
                const scale = style === 3 ? 0.5 : 1
                const layoutB = layoutStageLaneByEdges(l - 0.08 * scale, l)
                const layoutT = layoutStageLaneByEdges(
                    tiltWidenedEdge(l - 0.08 * scale, l - 0.64 * scale),
                    l,
                )
                draw(
                    skin.stageBorder,
                    place({ bl: layoutB.bl, tl: layoutT.tl, tr: layoutT.tr, br: layoutB.br }),
                    zKey,
                    alpha,
                )
                break
            }
            case 1: {
                const layoutB = layoutStageLaneByEdges(l - 0.0125, l + 0.0125)
                const layoutT = layoutStageLaneByEdges(
                    tiltWidenedEdge(l - 0.0125, l - 0.1),
                    tiltWidenedEdge(l + 0.0125, l + 0.1),
                )
                draw(
                    skin.laneDivider,
                    snapDividerThicknessToScreenPixels(
                        place({ bl: layoutB.bl, tl: layoutT.tl, tr: layoutT.tr, br: layoutB.br }),
                    ),
                    zKey,
                    alpha,
                )
                break
            }
        }
    }

    const drawRightBorder = (style: number, zKey: ZKey, alpha: number) => {
        switch (style) {
            case 0:
            case 3: {
                const scale = style === 3 ? 0.5 : 1
                const layoutB = layoutStageLaneByEdges(r + 0.08 * scale, r)
                const layoutT = layoutStageLaneByEdges(
                    tiltWidenedEdge(r + 0.08 * scale, r + 0.64 * scale),
                    r,
                )
                draw(
                    skin.stageBorder,
                    place({ bl: layoutB.bl, tl: layoutT.tl, tr: layoutT.tr, br: layoutB.br }),
                    zKey,
                    alpha,
                )
                break
            }
            case 1: {
                const layoutB = layoutStageLaneByEdges(r - 0.0125, r + 0.0125)
                const layoutT = layoutStageLaneByEdges(
                    tiltWidenedEdge(r - 0.0125, r - 0.1),
                    tiltWidenedEdge(r + 0.0125, r + 0.1),
                )
                draw(
                    skin.laneDivider,
                    snapDividerThicknessToScreenPixels(
                        place({ bl: layoutB.bl, tl: layoutT.tl, tr: layoutT.tr, br: layoutB.br }),
                    ),
                    zKey,
                    alpha,
                )
                break
            }
        }
    }

    const drawDividers = (
        divisionSize: number,
        parity: number,
        pivot: number,
        zKey: ZKey,
        alpha: number,
    ) => {
        if (divisionSize <= 0) return

        const eps = 0.001
        const parityOffset = parity === 1 ? divisionSize / 2 : 0
        const shiftedPivot = pivot + parityOffset

        const kStart = Math.floor((l - shiftedPivot + eps) / divisionSize) + 1
        const kEnd = Math.ceil((r - shiftedPivot - eps) / divisionSize) - 1

        for (let k = kStart; k <= kEnd; k++) {
            const pos = shiftedPivot + k * divisionSize
            const layoutB = layoutStageLaneByEdges(pos - 0.0125, pos + 0.0125)
            const layoutT = layoutStageLaneByEdges(
                tiltWidenedEdge(pos - 0.0125, pos - 0.1),
                tiltWidenedEdge(pos + 0.0125, pos + 0.1),
            )
            draw(
                skin.laneDivider,
                snapDividerThicknessToScreenPixels(
                    place({ bl: layoutB.bl, tl: layoutT.tl, tr: layoutT.tr, br: layoutB.br }),
                ),
                zKey,
                alpha,
            )
        }
    }

    const thicknessScale = lerp(
        1,
        travel > 0 ? clamp(1 / travel, 1, 4) : 4,
        DynamicLayout.stageTilt,
    )
    const judgmentDividerSize =
        0.014 * thicknessScale * tiltWidthFactor(travel) * DynamicLayout.wScale
    const judgmentDividerOffset = rotateVec(vec(judgmentDividerSize, 0), -DynamicLayout.rotate)
    const dividerDepthB = tiltDepth(1 + nh - nh / f + 0.001, travel)
    const dividerDepthT = tiltDepth(1 - nh + nh / f - 0.001, travel)

    const layoutJudgmentDivider = (dividerLane: number): Quad => {
        const b = transformedVecAt(dividerLane, dividerDepthB)
        const t = transformedVecAt(dividerLane, dividerDepthT)
        return {
            bl: vec(b.x - judgmentDividerOffset.x, b.y - judgmentDividerOffset.y),
            tl: vec(t.x - judgmentDividerOffset.x, t.y - judgmentDividerOffset.y),
            tr: vec(t.x + judgmentDividerOffset.x, t.y + judgmentDividerOffset.y),
            br: vec(b.x + judgmentDividerOffset.x, b.y + judgmentDividerOffset.y),
        }
    }

    const drawJudgmentDividers = (
        sprites: JudgmentSpriteSet,
        halfOffset: boolean,
        pivot: number,
        zLo: ZKey,
        zHi: ZKey,
        alpha: number,
    ) => {
        const eps = 0.001
        const shiftedPivot = pivot + (halfOffset ? 0.5 : 0)

        const kStart = Math.floor(l - shiftedPivot + eps) + 1
        const kEnd = Math.ceil(r - shiftedPivot - eps) - 1

        for (let k = kStart; k <= kEnd; k++) {
            const pos = shiftedPivot + k
            const divLayout = snapDividerThicknessToScreenPixels(place(layoutJudgmentDivider(pos)))
            const edgeWeight = width > 0 ? Math.abs(pos - lane) / width : 0
            draw(sprites.center, divLayout, zLo, alpha)
            draw(sprites.edge, divLayout, zHi, alpha * edgeWeight)
        }
    }

    const drawLeftJudgmentBorder = (
        sprites: JudgmentSpriteSet,
        style: number,
        zKey: ZKey,
        alpha: number,
    ) => {
        switch (style) {
            case 0:
            case 3: {
                if (width <= 0) return
                const layout = place(
                    perspectiveRect(
                        l,
                        Math.min(l + 1 / f / 2, lane),
                        1 - nh + nh / f,
                        1 + nh - nh / f,
                        travel,
                    ),
                )
                draw(sprites.edgeLeft, layout, zKey, alpha)
                break
            }
            case 1: {
                const layout = snapDividerThicknessToScreenPixels(place(layoutJudgmentDivider(l)))
                draw(sprites.edge, layout, zKey, alpha)
                break
            }
        }
    }

    const drawRightJudgmentBorder = (
        sprites: JudgmentSpriteSet,
        style: number,
        zKey: ZKey,
        alpha: number,
    ) => {
        switch (style) {
            case 0:
            case 3: {
                if (width <= 0) return
                const layout = place(
                    perspectiveRect(
                        r,
                        Math.max(r - 1 / f / 2, lane),
                        1 - nh + nh / f,
                        1 + nh - nh / f,
                        travel,
                    ),
                )
                draw(sprites.edgeLeft, layout, zKey, alpha)
                break
            }
            case 1: {
                const layout = snapDividerThicknessToScreenPixels(place(layoutJudgmentDivider(r)))
                draw(sprites.edge, layout, zKey, alpha)
                break
            }
        }
    }

    const drawGradient = (sprites: JudgmentSpriteSet, zKey: ZKey, alpha: number) => {
        const bottomL = place(perspectiveRect(lJl, lane, 1 + nh - nh / f, 1 + nh, travel))
        const bottomR = place(perspectiveRect(rJl, lane, 1 + nh - nh / f, 1 + nh, travel))
        const topL = place(perspectiveRect(lJl, lane, 1 - nh, 1 - nh + nh / f, travel))
        const topR = place(perspectiveRect(rJl, lane, 1 - nh, 1 - nh + nh / f, travel))
        const gradA = alpha * (1 - fw)
        const edgeA = alpha * fw
        if (gradA > 0) {
            draw(sprites.gradient, bottomL, zKey, gradA)
            draw(sprites.gradient, bottomR, zKey, gradA)
            draw(sprites.gradient, topL, zKey, gradA)
            draw(sprites.gradient, topR, zKey, gradA)
        }
        if (edgeA > 0) {
            draw(sprites.edge, bottomL, zKey, edgeA)
            draw(sprites.edge, bottomR, zKey, edgeA)
            draw(sprites.edge, topL, zKey, edgeA)
            draw(sprites.edge, topR, zKey, edgeA)
        }
    }

    const drawSingleLine = (sprites: JudgmentSpriteSet, zKey: ZKey, alpha: number) => {
        const halfThick = nh / f / 2
        const layout = place(perspectiveRect(lJl, rJl, 1 - halfThick, 1 + halfThick, travel))
        draw(sprites.edge, layout, zKey, alpha)
    }

    const la = laneAlpha * (1 - fw)
    if (la > 0) {
        draw(skin.laneBackground, place(layoutStageLaneByEdges(l, r)), z(0), la)

        const pLeft = leftBorderStyle.progress
        if (leftBorderStyle.start === leftBorderStyle.end) {
            drawLeftBorder(leftBorderStyle.start, z(3), la)
        } else {
            drawLeftBorder(leftBorderStyle.start, z(3), la * (1 - pLeft))
            drawLeftBorder(leftBorderStyle.end, z(4), la * pLeft)
        }

        const pRight = rightBorderStyle.progress
        if (rightBorderStyle.start === rightBorderStyle.end) {
            drawRightBorder(rightBorderStyle.start, z(3), la)
        } else {
            drawRightBorder(rightBorderStyle.start, z(3), la * (1 - pRight))
            drawRightBorder(rightBorderStyle.end, z(4), la * pRight)
        }

        const laDiv = la * props.divisionLineAlpha
        if (laDiv > 0) {
            const pDiv = division.progress
            if (
                division.start.size === division.end.size &&
                division.start.parity === division.end.parity
            ) {
                drawDividers(division.start.size, division.start.parity, pivotLane, z(3), laDiv)
            } else {
                if (1 - pDiv > 0) {
                    drawDividers(
                        division.start.size,
                        division.start.parity,
                        pivotLane,
                        z(3),
                        laDiv * (1 - pDiv),
                    )
                }
                if (pDiv > 0) {
                    drawDividers(
                        division.end.size,
                        division.end.parity,
                        pivotLane,
                        z(4),
                        laDiv * pDiv,
                    )
                }
            }
        }
    }

    const ja = judgeLineAlpha
    const jaBar = ja * wDefault
    const jaDec = jaBar * (1 - fw)
    const jaSingle = ja * wSingleLine

    if (jaBar > 0) {
        const bgLayout = place(perspectiveRect(lJl, rJl, 1 - nh, 1 + nh, travel))
        if (spritesSame) {
            draw(spritesA.background, bgLayout, z(1), jaBar)
        } else {
            draw(spritesA.background, bgLayout, z(1), jaBar * (1 - pSprites))
            draw(spritesB.background, bgLayout, z(2), jaBar * pSprites)
        }
    }

    const pLeft = leftBorderStyle.progress
    const pRight = rightBorderStyle.progress
    const pDiv = division.progress

    const startHasHalfOffset = division.start.parity === 1 && division.start.size % 2 === 1
    const endHasHalfOffset = division.end.parity === 1 && division.end.size % 2 === 1
    const judgmentDividersSame = startHasHalfOffset === endHasHalfOffset

    if (jaDec > 0) {
        if (judgmentDividersSame && spritesSame) {
            drawJudgmentDividers(spritesA, startHasHalfOffset, pivotLane, z(5), z(6), jaDec)
        } else if (judgmentDividersSame) {
            drawJudgmentDividers(
                spritesA,
                startHasHalfOffset,
                pivotLane,
                z(5),
                z(6),
                jaDec * (1 - pSprites),
            )
            drawJudgmentDividers(
                spritesB,
                startHasHalfOffset,
                pivotLane,
                z(9),
                z(10),
                jaDec * pSprites,
            )
        } else if (spritesSame) {
            drawJudgmentDividers(
                spritesA,
                startHasHalfOffset,
                pivotLane,
                z(5),
                z(6),
                jaDec * (1 - pDiv),
            )
            drawJudgmentDividers(spritesA, endHasHalfOffset, pivotLane, z(7), z(8), jaDec * pDiv)
        } else {
            const alphaAa = (1 - pSprites) * (1 - pDiv)
            const alphaAb = (1 - pSprites) * pDiv
            const alphaBa = pSprites * (1 - pDiv)
            const alphaBb = pSprites * pDiv
            if (alphaAa > 0)
                drawJudgmentDividers(
                    spritesA,
                    startHasHalfOffset,
                    pivotLane,
                    z(5),
                    z(6),
                    jaDec * alphaAa,
                )
            if (alphaAb > 0)
                drawJudgmentDividers(
                    spritesA,
                    endHasHalfOffset,
                    pivotLane,
                    z(7),
                    z(8),
                    jaDec * alphaAb,
                )
            if (alphaBa > 0)
                drawJudgmentDividers(
                    spritesB,
                    startHasHalfOffset,
                    pivotLane,
                    z(9),
                    z(10),
                    jaDec * alphaBa,
                )
            if (alphaBb > 0)
                drawJudgmentDividers(
                    spritesB,
                    endHasHalfOffset,
                    pivotLane,
                    z(11),
                    z(12),
                    jaDec * alphaBb,
                )
        }
    }

    if (jaBar > 0) {
        if (spritesSame) {
            drawGradient(spritesA, z(13), jaBar)
        } else {
            drawGradient(spritesA, z(13), jaBar * (1 - pSprites))
            drawGradient(spritesB, z(14), jaBar * pSprites)
        }
    }

    if (jaDec > 0) {
        if (spritesSame && leftBorderStyle.start === leftBorderStyle.end) {
            drawLeftJudgmentBorder(spritesA, leftBorderStyle.start, z(5), jaDec)
        } else {
            const alphaAa = (1 - pSprites) * (1 - pLeft)
            const alphaAb = (1 - pSprites) * pLeft
            const alphaBa = pSprites * (1 - pLeft)
            const alphaBb = pSprites * pLeft
            if (alphaAa > 0)
                drawLeftJudgmentBorder(spritesA, leftBorderStyle.start, z(5), jaDec * alphaAa)
            if (alphaAb > 0)
                drawLeftJudgmentBorder(spritesA, leftBorderStyle.end, z(7), jaDec * alphaAb)
            if (alphaBa > 0)
                drawLeftJudgmentBorder(spritesB, leftBorderStyle.start, z(9), jaDec * alphaBa)
            if (alphaBb > 0)
                drawLeftJudgmentBorder(spritesB, leftBorderStyle.end, z(11), jaDec * alphaBb)
        }

        if (spritesSame && rightBorderStyle.start === rightBorderStyle.end) {
            drawRightJudgmentBorder(spritesA, rightBorderStyle.start, z(5), jaDec)
        } else {
            const alphaAa = (1 - pSprites) * (1 - pRight)
            const alphaAb = (1 - pSprites) * pRight
            const alphaBa = pSprites * (1 - pRight)
            const alphaBb = pSprites * pRight
            if (alphaAa > 0)
                drawRightJudgmentBorder(spritesA, rightBorderStyle.start, z(5), jaDec * alphaAa)
            if (alphaAb > 0)
                drawRightJudgmentBorder(spritesA, rightBorderStyle.end, z(7), jaDec * alphaAb)
            if (alphaBa > 0)
                drawRightJudgmentBorder(spritesB, rightBorderStyle.start, z(9), jaDec * alphaBa)
            if (alphaBb > 0)
                drawRightJudgmentBorder(spritesB, rightBorderStyle.end, z(11), jaDec * alphaBb)
        }
    }

    if (jaSingle > 0) {
        if (spritesSame) {
            drawSingleLine(spritesA, z(15), jaSingle)
        } else {
            drawSingleLine(spritesA, z(15), jaSingle * (1 - pSprites))
            drawSingleLine(spritesB, z(16), jaSingle * pSprites)
        }
    }
}

const drawFallbackStage = (
    draw: Draw,
    skin: PreviewSkin,
    props: StageProps,
    transform: AffineTransform,
) => {
    const { lane, width, pivotLane, division, judgeLineStyle, order } = props

    const place = (q: Quad) => transformQuadAffine(transform, q)

    const wDefault = transitionWeight(judgeLineStyle, 0)
    const wSingleLine = transitionWeight(judgeLineStyle, 1)
    const travel = approach(1 - props.yOffset)
    const nh = DynamicLayout.noteH
    const l = lane - width
    const r = lane + width
    const fw = clamp(props.fullWidth, 0, 1)
    const halfJl = lerp(width, FULL_WIDTH_HALF_EXTENT, fw)
    const lJl = lane - halfJl
    const rJl = lane + halfJl
    const zLo = getZAlt(LAYER_STAGE, order * 4)
    const zMid = getZAlt(LAYER_STAGE, order * 4 + 1)
    const zHi = getZAlt(LAYER_STAGE, order * 4 + 2)
    const zSingle = getZAlt(LAYER_STAGE, order * 4 + 3)
    const la = props.laneAlpha * (1 - fw)
    const ja = props.judgeLineAlpha

    if (la > 0) {
        let layoutB = layoutStageLaneByEdges(l - 0.25, l)
        let layoutT = layoutStageLaneByEdges(tiltWidenedEdge(l - 0.25, l - 1), l)
        draw(
            skin.stageLeftBorder,
            place({ bl: layoutB.bl, tl: layoutT.tl, tr: layoutT.tr, br: layoutB.br }),
            zMid,
            la,
        )
        layoutB = layoutStageLaneByEdges(r, r + 0.25)
        layoutT = layoutStageLaneByEdges(r, tiltWidenedEdge(r + 0.25, r + 1))
        draw(
            skin.stageRightBorder,
            place({ bl: layoutB.bl, tl: layoutT.tl, tr: layoutT.tr, br: layoutB.br }),
            zMid,
            la,
        )

        const eps = 0.001
        const divisionSize = division.end.size
        const parityOffset = division.end.parity === 1 ? divisionSize / 2 : 0
        const shiftedPivot = pivotLane + parityOffset
        let prev = l
        if (divisionSize > 0) {
            const kStart = Math.floor((l - shiftedPivot + eps) / divisionSize) + 1
            const kEnd = Math.ceil((r - shiftedPivot - eps) / divisionSize) - 1
            for (let k = kStart; k <= kEnd; k++) {
                const pos = shiftedPivot + k * divisionSize
                draw(skin.lane, place(layoutStageLaneByEdges(prev, pos)), zLo, la)
                prev = pos
            }
        }
        draw(skin.lane, place(layoutStageLaneByEdges(prev, r)), zLo, la)
    }

    if (ja * wDefault > 0) {
        const layout = place(perspectiveRect(lJl, rJl, 1 - nh, 1 + nh, travel))
        draw(skin.judgmentLine, layout, zHi, ja * wDefault)
    }
    if (ja * wSingleLine > 0) {
        const halfThick = nh / JUDGE_LINE_BORDER_FACTOR / 2
        const layout = place(perspectiveRect(lJl, rJl, 1 - halfThick, 1 + halfThick, travel))
        draw(skin.judgmentLine, layout, zSingle, ja * wSingleLine)
    }
}
