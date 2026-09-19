import {
    clamp,
    ease,
    identityAffineTransform,
    lerp,
    rotateVec,
    subVec,
    translateQuad,
    unlerp,
    vec,
    type AffineTransform,
    type EaseTypeValue,
    type Quad,
    type Vec,
} from './math'

export const LANE_T = 47 / 850
export const LANE_B = 1176 / 850

export const NOTE_H = 75 / 850 / 2
export const NOTE_EDGE_W = 0.25
export const NOTE_SLIM_EDGE_W = 0.125

export const TARGET_ASPECT_RATIO = 16 / 9

export const FIELD_T_FACTOR = 0.5 + 1.15875 * (47 / 1176)
export const FIELD_B_FACTOR = 0.5 - 1.15875 * (803 / 1176)
export const FIELD_W_FACTOR = (1.15875 * (1420 / 1176)) / TARGET_ASPECT_RATIO / 12

export const APPROACH_SCALE = 1.06 ** -45
export const DEFAULT_APPROACH_CUTOFF = 5
const APPROACH_TILT_LERP_MIN = 0.05
export const STAGE_WIDTH_MID = (APPROACH_SCALE + 1) / 2
const STAGE_TILT_VANISH_MIN = 0.2

export const FlickDirection = {
    upOmni: 0,
    upLeft: 1,
    upRight: 2,
    downOmni: 3,
    downLeft: 4,
    downRight: 5,
} as const

export type FlickDirectionValue = (typeof FlickDirection)[keyof typeof FlickDirection]

export type CameraChange = {
    time: number
    lane: number
    size: number
    zoom: number
    zoomTargetLane: number
    zoomTargetY: number
    zoomVerticalAlign: 0 | 1
    rotate: number
    stageTilt: number
    ease: EaseTypeValue
}

export type CameraInfo = {
    lane: number
    size: number
    zoom: number
    zoomTarget: Vec
    zoomAnchor: Vec
    rotate: number
    stageTilt: number
}

export type LayoutTransform = {
    t: number
    wScale: number
    hScale: number
    xTranslate: number
    rotate: number
    stageTilt: number
    sizeZoom: number
}

export const Layout = {
    fieldW: 0,
    fieldH: 0,
    screenW: 0,
    screenH: 2,
    coverDepth: APPROACH_SCALE,
    cutoffDepth: DEFAULT_APPROACH_CUTOFF,
}

export const DynamicLayout = {
    t: 0,
    wScale: 0,
    hScale: 0,
    xTranslate: 0,
    rotate: 0,
    stageTilt: 1,
    sizeZoom: 1,
    noteH: 0,
    scaledNoteH: 0,
    progressStart: 0,
    progressCutoff: 0,
    widthOffset: 0,
    laneT: 0,
    laneB: 0,
    stageLaneT: 0,
    stageLaneB: 0,
    screenPixelSize: 0,
}

export const initLayout = (displayWidth: number, displayHeight: number) => {
    const aspectRatio = displayWidth / displayHeight
    Layout.screenW = 2 * aspectRatio
    Layout.screenH = 2
    DynamicLayout.screenPixelSize = 2 / displayHeight

    if (aspectRatio > TARGET_ASPECT_RATIO) {
        Layout.fieldW = 2 * TARGET_ASPECT_RATIO
        Layout.fieldH = 2
    } else {
        Layout.fieldW = 2 * aspectRatio
        Layout.fieldH = (2 * aspectRatio) / TARGET_ASPECT_RATIO
    }
}

export const defaultCameraInfo = (): CameraInfo => ({
    lane: 0,
    size: 6,
    zoom: 1,
    zoomTarget: vec(0, 0),
    zoomAnchor: vec(0, 0),
    rotate: 0,
    stageTilt: 1,
})

const toCameraInfo = (camera: CameraChange): CameraInfo => ({
    lane: camera.lane,
    size: camera.size,
    zoom: camera.zoom,
    zoomTarget: cameraZoomTargetAt(
        camera.lane,
        camera.size,
        camera.zoomTargetLane,
        camera.zoomTargetY,
        camera.stageTilt,
    ),
    zoomAnchor: cameraZoomAnchor(camera.zoomVerticalAlign),
    rotate: camera.rotate,
    stageTilt: camera.stageTilt,
})

export const getCameraInfo = (cameras: CameraChange[], t: number): CameraInfo => {
    if (!cameras.length) return defaultCameraInfo()

    let lo = 0
    let hi = cameras.length - 1
    let index = -1
    while (lo <= hi) {
        const mid = (lo + hi) >> 1
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (cameras[mid]!.time <= t) {
            index = mid
            lo = mid + 1
        } else {
            hi = mid - 1
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (index === -1) return toCameraInfo(cameras[0]!)

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const a = cameras[index]!
    const b = cameras[index + 1]
    if (!b || b.time <= a.time) return toCameraInfo(a)

    const p = ease(a.ease, unlerp(a.time, b.time, t))
    const infoA = toCameraInfo(a)
    const infoB = toCameraInfo(b)

    return {
        lane: lerp(a.lane, b.lane, p),
        size: lerp(a.size, b.size, p),
        zoom: lerp(a.zoom, b.zoom, p),
        zoomTarget: vec(
            lerp(infoA.zoomTarget.x, infoB.zoomTarget.x, p),
            lerp(infoA.zoomTarget.y, infoB.zoomTarget.y, p),
        ),
        zoomAnchor: vec(
            lerp(infoA.zoomAnchor.x, infoB.zoomAnchor.x, p),
            lerp(infoA.zoomAnchor.y, infoB.zoomAnchor.y, p),
        ),
        rotate: lerp(a.rotate, b.rotate, p),
        stageTilt: lerp(a.stageTilt, b.stageTilt, p),
    }
}

export const cameraZoomTargetAt = (
    lane: number,
    size: number,
    targetLane: number,
    targetY: number,
    tilt: number,
): Vec => {
    const sizeZoom = 6 / size
    const w = Layout.fieldW * FIELD_W_FACTOR * sizeZoom
    const tTop = Layout.fieldH * FIELD_T_FACTOR
    const b = Layout.fieldH * FIELD_B_FACTOR
    const travel = approachAtTilt(1 - targetY, tilt)
    const targetTotalLane = lane + targetLane
    return vec(
        targetTotalLane * widthFactorAtTilt(travel, tilt) * w - lane * w,
        travel * (b - tTop) + tTop,
    )
}

export const cameraZoomAnchor = (align: 0 | 1): Vec =>
    vec(0, align === 1 ? 0 : Layout.fieldH * FIELD_B_FACTOR)

export const refreshLayout = (camera: CameraInfo, dynamicStages: boolean) => {
    const base = baseLayoutTransform(camera)
    DynamicLayout.t = base.t
    DynamicLayout.wScale = base.wScale
    DynamicLayout.hScale = base.hScale
    DynamicLayout.xTranslate = base.xTranslate
    DynamicLayout.rotate = base.rotate
    DynamicLayout.stageTilt = base.stageTilt
    DynamicLayout.sizeZoom = base.sizeZoom

    const tilt = base.stageTilt

    DynamicLayout.widthOffset = (1 - tilt) * STAGE_WIDTH_MID
    const vanishTilt = Math.max(tilt, STAGE_TILT_VANISH_MIN)
    const vanishExt = ((1 - vanishTilt) * STAGE_WIDTH_MID) / vanishTilt
    DynamicLayout.laneT = LANE_T - vanishExt
    DynamicLayout.laneB = LANE_B + vanishExt
    if (dynamicStages) {
        DynamicLayout.stageLaneT = LANE_T - vanishExt * 0.9
        DynamicLayout.stageLaneB = LANE_B + vanishExt + 3
    } else {
        DynamicLayout.stageLaneT = LANE_T - vanishExt
        DynamicLayout.stageLaneB = LANE_B + vanishExt
    }

    const baseNoteH = NOTE_H * (0.6 * base.sizeZoom + 0.4)
    const flatNoteH =
        (STAGE_WIDTH_MID * DynamicLayout.wScale) / (2 * Math.abs(DynamicLayout.hScale))
    DynamicLayout.noteH = lerp(flatNoteH, baseNoteH, tilt)

    const zoomed = zoomedLayoutTransform(
        base,
        camera.zoom,
        camera.zoomTarget,
        camera.zoomAnchor,
        camera.rotate,
    )
    DynamicLayout.t = zoomed.t
    DynamicLayout.wScale = zoomed.wScale
    DynamicLayout.hScale = zoomed.hScale
    DynamicLayout.xTranslate = zoomed.xTranslate
    DynamicLayout.rotate = zoomed.rotate

    DynamicLayout.scaledNoteH = DynamicLayout.noteH * DynamicLayout.hScale

    DynamicLayout.progressStart = inverseApproachTilt(Layout.coverDepth - vanishExt)
    DynamicLayout.progressCutoff = inverseApproachTilt(Layout.cutoffDepth)
}

export const baseLayoutTransform = (camera: CameraInfo): LayoutTransform => {
    const sizeZoom = 6 / camera.size
    const t = Layout.fieldH * FIELD_T_FACTOR
    const w = Layout.fieldW * FIELD_W_FACTOR * sizeZoom
    return {
        t,
        wScale: w,
        hScale: Layout.fieldH * FIELD_B_FACTOR - t,
        xTranslate: -camera.lane * w,
        rotate: 0,
        stageTilt: clamp(camera.stageTilt, 0, 1),
        sizeZoom,
    }
}

export const zoomedLayoutTransform = (
    transform: LayoutTransform,
    zoom: number,
    target: Vec,
    anchor: Vec,
    rotate: number,
): LayoutTransform => ({
    t: zoom * (transform.t - target.y) + anchor.y,
    wScale: zoom * transform.wScale,
    hScale: zoom * transform.hScale,
    xTranslate: zoom * (transform.xTranslate - target.x) + anchor.x,
    rotate,
    stageTilt: transform.stageTilt,
    sizeZoom: transform.sizeZoom,
})

export const layoutTransformAtCamera = (camera: CameraInfo): LayoutTransform =>
    zoomedLayoutTransform(
        baseLayoutTransform(camera),
        camera.zoom,
        camera.zoomTarget,
        camera.zoomAnchor,
        camera.rotate,
    )

export const currentLayoutTransform = (): LayoutTransform => ({
    t: DynamicLayout.t,
    wScale: DynamicLayout.wScale,
    hScale: DynamicLayout.hScale,
    xTranslate: DynamicLayout.xTranslate,
    rotate: DynamicLayout.rotate,
    stageTilt: DynamicLayout.stageTilt,
    sizeZoom: DynamicLayout.sizeZoom,
})

const approachCurveBase = (x: number) => APPROACH_SCALE ** (1 - x)

const inverseApproachCurveBase = (approachValue: number) =>
    1 - Math.log(approachValue) / Math.log(APPROACH_SCALE)

const approachSliceWindow = (tilt: number, spawnDepth: number): [number, number] => {
    const wJudge = widthFactorAtTilt(1, tilt)
    const spawnFraction = (tilt * (1 - spawnDepth)) / wJudge
    const sliceSpawn = 1 - spawnFraction
    return [inverseApproachCurveBase(sliceSpawn), sliceSpawn]
}

const approachSlice = (progress: number, tilt: number, spawnDepth: number) => {
    const [start, sliceSpawn] = approachSliceWindow(tilt, spawnDepth)
    const travel = approachCurveBase(lerp(start, 1, progress))
    return lerp(spawnDepth, 1, unlerp(sliceSpawn, 1, travel))
}

const inverseApproachSlice = (travel: number, tilt: number, spawnDepth: number) => {
    const [start, sliceSpawn] = approachSliceWindow(tilt, spawnDepth)
    const raw = lerp(sliceSpawn, 1, unlerp(spawnDepth, 1, travel))
    return unlerp(start, 1, inverseApproachCurveBase(raw))
}

export const approachAtTilt = (progress: number, tilt: number): number => {
    if (tilt >= 1) return approachCurveBase(progress)

    const spawnDepth = APPROACH_SCALE
    if (tilt <= 0) return lerp(spawnDepth, 1, progress)

    if (tilt < APPROACH_TILT_LERP_MIN) {
        const linear = lerp(spawnDepth, 1, progress)
        const sliceAtFloor = approachSlice(progress, APPROACH_TILT_LERP_MIN, spawnDepth)
        return lerp(linear, sliceAtFloor, tilt / APPROACH_TILT_LERP_MIN)
    }

    return approachSlice(progress, tilt, spawnDepth)
}

export const approach = (progress: number) => approachAtTilt(progress, DynamicLayout.stageTilt)

export const inverseApproachTilt = (approachValue: number): number => {
    const tilt = DynamicLayout.stageTilt
    if (tilt >= 1) return inverseApproachCurveBase(approachValue)

    const spawnDepth = APPROACH_SCALE
    if (tilt < APPROACH_TILT_LERP_MIN) {
        let lo = -8
        let hi = 8
        for (let i = 0; i < 20; i++) {
            const mid = (lo + hi) / 2
            if (approachAtTilt(mid, tilt) < approachValue) {
                lo = mid
            } else {
                hi = mid
            }
        }
        return (lo + hi) / 2
    }

    return inverseApproachSlice(approachValue, tilt, spawnDepth)
}

export const widthFactorAtTilt = (depth: number, tilt: number) =>
    tilt * depth + (1 - tilt) * STAGE_WIDTH_MID

export const tiltWidthFactor = (depth: number) =>
    DynamicLayout.stageTilt * depth + DynamicLayout.widthOffset

export const tiltDepth = (lineY: number, travel: number) =>
    travel + (lineY - 1) * lerp(1, travel, DynamicLayout.stageTilt)

export const tiltWidenedEdge = (bottomEdge: number, topEdge: number) =>
    lerp(bottomEdge, topEdge, DynamicLayout.stageTilt)

export const transformVec = (v: Vec): Vec =>
    rotateVec(
        vec(
            v.x * DynamicLayout.wScale + DynamicLayout.xTranslate,
            v.y * DynamicLayout.hScale + DynamicLayout.t,
        ),
        -DynamicLayout.rotate,
    )

export const transformQuad = (q: Quad): Quad => ({
    bl: transformVec(q.bl),
    tl: transformVec(q.tl),
    tr: transformVec(q.tr),
    br: transformVec(q.br),
})

export const transformedVecAt = (lane: number, travel = 1): Vec =>
    transformVec(vec(lane * tiltWidthFactor(travel), travel))

export const preRotationVecAt = (lane: number, travel = 1): Vec =>
    vec(
        lane * tiltWidthFactor(travel) * DynamicLayout.wScale + DynamicLayout.xTranslate,
        travel * DynamicLayout.hScale + DynamicLayout.t,
    )

export const perspectiveVec = (x: number, y: number, travel = 1): Vec =>
    transformVec(vec(x * tiltWidthFactor(y * travel), y * travel))

export const perspectiveRect = (l: number, r: number, t: number, b: number, travel = 1): Quad => {
    const depthB = tiltDepth(b, travel)
    const depthT = tiltDepth(t, travel)
    const wb = tiltWidthFactor(depthB)
    const wt = tiltWidthFactor(depthT)
    return transformQuad({
        bl: vec(l * wb, depthB),
        br: vec(r * wb, depthB),
        tl: vec(l * wt, depthT),
        tr: vec(r * wt, depthT),
    })
}

export type StageTransform = {
    sr: number
    px: number
    py: number
    tx: number
    ty: number
}

export const identityStageTransform: StageTransform = { sr: 0, px: 0, py: 0, tx: 0, ty: 0 }

export const stageTransformIsIdentity = (st: StageTransform) =>
    st.sr === 0 && st.tx === 0 && st.ty === 0

export const stageTransformToAffineOrIdentity = (st?: StageTransform): AffineTransform =>
    !st || stageTransformIsIdentity(st) ? identityAffineTransform : stageTransformToAffine(st)

export const stageTransformToAffine = (st: StageTransform): AffineTransform => {
    const cs = Math.cos(st.sr)
    const sn = Math.sin(st.sr)
    return {
        a00: cs,
        a01: sn,
        a02: st.px * (1 - cs) - sn * st.py + st.tx,
        a10: -sn,
        a11: cs,
        a12: st.py * (1 - cs) + sn * st.px + st.ty,
    }
}

const stageRotationPivot = (camera: LayoutTransform, judgeDepth: number): Vec =>
    rotateVec(vec(camera.xTranslate, judgeDepth * camera.hScale + camera.t), -camera.rotate)

export const computeStageTransform = (
    camera: LayoutTransform,
    stageRotate: number,
    xLaneTranslate: number,
    yLaneTranslate: number,
    maskLane: number,
    centerWeight = 0,
): StageTransform => {
    const travel = approachAtTilt(1, camera.stageTilt)
    const width = widthFactorAtTilt(travel, camera.stageTilt)
    const judgeCenter = rotateVec(
        vec(
            maskLane * width * camera.wScale + camera.xTranslate,
            travel * camera.hScale + camera.t,
        ),
        -camera.rotate,
    )
    const baseT = Layout.fieldH * FIELD_T_FACTOR
    const baseH = Layout.fieldH * FIELD_B_FACTOR - baseT
    const centerJudgeY = camera.hScale * (travel + baseT / baseH)
    const offset = rotateVec(
        vec(
            xLaneTranslate * camera.wScale,
            yLaneTranslate * camera.wScale - centerWeight * centerJudgeY,
        ),
        -camera.rotate,
    )
    const pivot = stageRotationPivot(camera, travel)
    const cs = Math.cos(stageRotate)
    const sn = Math.sin(stageRotate)
    const dx = judgeCenter.x - pivot.x
    const dy = judgeCenter.y - pivot.y
    return {
        sr: stageRotate,
        px: pivot.x,
        py: pivot.y,
        tx: offset.x + (1 - cs) * dx - sn * dy,
        ty: offset.y + (1 - cs) * dy + sn * dx,
    }
}

export const blendStageTransform = (
    a: StageTransform,
    b: StageTransform,
    frac: number,
): StageTransform => ({
    sr: lerp(a.sr, b.sr, frac),
    px: lerp(a.px, b.px, frac),
    py: lerp(a.py, b.py, frac),
    tx: lerp(a.tx, b.tx, frac),
    ty: lerp(a.ty, b.ty, frac),
})

export const layoutSekaiStage = (): Quad => {
    const w = ((2048 / 1420) * 12) / 2
    const h = 1176 / 850
    return transformQuad({
        bl: vec(-w, LANE_T + h),
        br: vec(w, LANE_T + h),
        tl: vec(-w, LANE_T),
        tr: vec(w, LANE_T),
    })
}

export const layoutStageLaneByEdges = (l: number, r: number, yOffset = 0): Quad =>
    perspectiveRect(l, r, DynamicLayout.stageLaneT, DynamicLayout.stageLaneB, approach(1 - yOffset))

export const layoutNoteBodyByEdges = (l: number, r: number, h: number, travel: number): Quad =>
    perspectiveRect(l, r, 1 - h, 1 + h, travel)

export const layoutNoteBodySlicesByEdges = (
    l: number,
    r: number,
    h: number,
    edgeW: number,
    travel: number,
): [Quad, Quad, Quad] => {
    const m = (l + r) / 2
    if (r < l) l = r = m
    const ml = Math.min(l + edgeW, m)
    const mr = Math.max(r - edgeW, m)
    return [
        layoutNoteBodyByEdges(l, ml, h, travel),
        layoutNoteBodyByEdges(ml, mr, h, travel),
        layoutNoteBodyByEdges(mr, r, h, travel),
    ]
}

export const layoutRegularNoteBody = (lane: number, size: number, travel: number) =>
    layoutNoteBodySlicesByEdges(lane - size, lane + size, DynamicLayout.noteH, NOTE_EDGE_W, travel)

export const layoutRegularNoteBodyFallback = (lane: number, size: number, travel: number) =>
    layoutNoteBodyByEdges(lane - size, lane + size, DynamicLayout.noteH, travel)

export const layoutSlimNoteBody = (lane: number, size: number, travel: number) =>
    layoutNoteBodySlicesByEdges(
        lane - size,
        lane + size,
        DynamicLayout.noteH,
        NOTE_SLIM_EDGE_W,
        travel,
    )

export const layoutSlimNoteBodyFallback = (lane: number, size: number, travel: number) =>
    layoutNoteBodyByEdges(lane - size, lane + size, DynamicLayout.noteH / 2, travel)

export const layoutTick = (lane: number, travel: number): Quad => {
    const center = transformedVecAt(lane, travel)
    const h = -DynamicLayout.scaledNoteH * tiltWidthFactor(travel)
    const rot = -DynamicLayout.rotate
    const dx = rotateVec(vec(h, 0), rot)
    const dy = rotateVec(vec(0, h), rot)
    return {
        bl: vec(center.x - dx.x - dy.x, center.y - dx.y - dy.y),
        tl: vec(center.x - dx.x + dy.x, center.y - dx.y + dy.y),
        tr: vec(center.x + dx.x + dy.x, center.y + dx.y + dy.y),
        br: vec(center.x + dx.x - dy.x, center.y + dx.y - dy.y),
    }
}

export const layoutFlickArrow = (
    lane: number,
    size: number,
    direction: FlickDirectionValue,
    travel: number,
    animationProgress: number,
): Quad => {
    let isDown = false
    let reverse = false
    let animationTopXOffset = 0
    switch (direction) {
        case FlickDirection.upOmni:
            break
        case FlickDirection.downOmni:
            isDown = true
            break
        case FlickDirection.upLeft:
            animationTopXOffset = -1
            break
        case FlickDirection.upRight:
            reverse = true
            animationTopXOffset = 1
            break
        case FlickDirection.downLeft:
            isDown = true
            animationTopXOffset = 1
            break
        case FlickDirection.downRight:
            isDown = true
            reverse = true
            animationTopXOffset = -1
            break
    }

    const w = clamp(size, 0, 3) / 2
    const baseBl = transformedVecAt(lane - w, travel)
    const baseBr = transformedVecAt(lane + w, travel)
    const up = rotateVec(subVec(baseBr, baseBl), Math.PI / 2)
    const baseTl = vec(baseBl.x + up.x, baseBl.y + up.y)
    const baseTr = vec(baseBr.x + up.x, baseBr.y + up.y)
    const offsetScale = isDown ? 1 - animationProgress : animationProgress
    const offsetBase = rotateVec(
        vec(animationTopXOffset * DynamicLayout.wScale, 2 * DynamicLayout.wScale),
        -DynamicLayout.rotate,
    )
    const factor = offsetScale * tiltWidthFactor(travel)
    const offset = vec(offsetBase.x * factor, offsetBase.y * factor)

    const result = translateQuad({ bl: baseBl, br: baseBr, tl: baseTl, tr: baseTr }, offset)
    if (reverse) {
        return { bl: result.br, br: result.bl, tl: result.tr, tr: result.tl }
    }
    return result
}

export const layoutFlickArrowFallback = (
    lane: number,
    size: number,
    direction: FlickDirectionValue,
    travel: number,
    animationProgress: number,
): Quad => {
    let rotation = 0
    let animationTopXOffset = 0
    let isDown = false
    switch (direction) {
        case FlickDirection.upOmni:
            break
        case FlickDirection.downOmni:
            rotation = Math.PI
            isDown = true
            break
        case FlickDirection.upLeft:
            rotation = Math.PI / 6
            animationTopXOffset = -1
            break
        case FlickDirection.upRight:
            rotation = -Math.PI / 6
            animationTopXOffset = 1
            break
        case FlickDirection.downLeft:
            rotation = (Math.PI * 5) / 6
            animationTopXOffset = 1
            isDown = true
            lane -= 0.25
            break
        case FlickDirection.downRight:
            rotation = (-Math.PI * 5) / 6
            animationTopXOffset = -1
            isDown = true
            lane += 0.25
            break
    }

    const w = clamp(size / 2, 1, 2)
    const offsetScale = isDown ? 1 - animationProgress : animationProgress
    const width = tiltWidthFactor(travel)
    const offset = vec(
        animationTopXOffset * DynamicLayout.wScale * offsetScale * width,
        2 * DynamicLayout.wScale * offsetScale * width,
    )
    const scale = w * DynamicLayout.wScale * width
    const center = transformedVecAt(lane, travel)

    const corner = (x: number, y: number): Vec => {
        let p = rotateVec(vec(x, y), rotation)
        p = vec(p.x * scale + offset.x, p.y * scale + offset.y)
        p = rotateVec(p, -DynamicLayout.rotate)
        return vec(p.x + center.x, p.y + center.y)
    }

    return {
        bl: corner(-1, -1),
        tl: corner(-1, 1),
        tr: corner(1, 1),
        br: corner(1, -1),
    }
}

export const layoutLinearEffect = (lane: number, shear: number, yOffset = 0): Quad => {
    const w = 1
    const travel = approach(1 - yOffset)
    const bl = transformedVecAt(lane - w, travel)
    const br = transformedVecAt(lane + w, travel)
    const d = subVec(br, bl)
    const shearScale = (shear + 0.125 * lane) / 2
    const up = vec(
        -d.y + d.x * shearScale, // rotate(d, pi/2) + shearScale * d
        d.x + d.y * shearScale,
    )
    return {
        bl,
        br,
        tl: vec(bl.x + up.x, bl.y + up.y),
        tr: vec(br.x + up.x, br.y + up.y),
    }
}

export const layoutRotatedLinearEffect = (lane: number, shear: number, yOffset = 0): Quad => {
    const w = 1
    const travel = approach(1 - yOffset)
    const bl = transformedVecAt(lane - w, travel)
    const br = transformedVecAt(lane + w, travel)
    const d = subVec(br, bl)
    const up = vec(-d.y, d.x)
    const angle = Math.atan(-(shear + 0.125 * lane) / 2)
    const pivot = vec((bl.x + br.x) / 2, (bl.y + br.y) / 2)

    const rotateAbout = (p: Vec): Vec => {
        const rotated = rotateVec(vec(p.x - pivot.x, p.y - pivot.y), angle)
        return vec(rotated.x + pivot.x, rotated.y + pivot.y)
    }

    return {
        bl: rotateAbout(bl),
        br: rotateAbout(br),
        tl: rotateAbout(vec(bl.x + up.x, bl.y + up.y)),
        tr: rotateAbout(vec(br.x + up.x, br.y + up.y)),
    }
}

export const layoutCircularEffect = (lane: number, w: number, h: number, yOffset = 0): Quad => {
    const travel = approach(1 - yOffset)
    const width = tiltWidthFactor(travel)
    w *= width
    h *= DynamicLayout.wScale / DynamicLayout.hScale
    const t = travel + h * width
    const b = travel - h * width
    const wb = tiltWidthFactor(b)
    const wt = tiltWidthFactor(t)
    return transformQuad({
        bl: vec(lane * wb - w, b),
        br: vec(lane * wb + w, b),
        tl: vec(lane * wt - w, t),
        tr: vec(lane * wt + w, t),
    })
}

export const layoutTickEffect = (lane: number, yOffset = 0): Quad => {
    const travel = approach(1 - yOffset)
    const w = 4 * DynamicLayout.wScale * tiltWidthFactor(travel)
    const center = transformedVecAt(lane, travel)
    const rot = -DynamicLayout.rotate
    const dx = rotateVec(vec(w, 0), rot)
    const dy = rotateVec(vec(0, w), rot)
    return {
        bl: vec(center.x - dx.x - dy.x, center.y - dx.y - dy.y),
        tl: vec(center.x - dx.x + dy.x, center.y - dx.y + dy.y),
        tr: vec(center.x + dx.x + dy.x, center.y + dx.y + dy.y),
        br: vec(center.x + dx.x - dy.x, center.y + dx.y - dy.y),
    }
}

export const layoutParticleLane = (lane: number, size: number, yOffset = 0): Quad =>
    perspectiveRect(
        lane - size,
        lane + size,
        DynamicLayout.laneT,
        DynamicLayout.laneB,
        approach(1 - yOffset),
    )

export const layoutSlotEffect = (lane: number, yOffset = 0): Quad => {
    const travel = approach(1 - yOffset)
    const nh = DynamicLayout.noteH
    return perspectiveRect(lane - 0.5, lane + 0.5, 1 - nh, 1 + nh, travel)
}

export const layoutSlotGlowEffect = (
    lane: number,
    size: number,
    height: number,
    yOffset = 0,
): Quad => {
    const s = 1.25
    const travel = approach(1 - yOffset)
    const h = 4.25 * DynamicLayout.wScale * tiltWidthFactor(travel)
    const up = rotateVec(vec(0, h), -DynamicLayout.rotate)
    const lMin = transformedVecAt(lane - size, travel)
    const rMin = transformedVecAt(lane + size, travel)
    const lMax = transformedVecAt((lane - size) * s, travel)
    const rMax = transformedVecAt((lane + size) * s, travel)
    return {
        bl: lMin,
        br: rMin,
        tl: vec(lerp(lMin.x, lMax.x + up.x, height), lerp(lMin.y, lMax.y + up.y, height)),
        tr: vec(lerp(rMin.x, rMax.x + up.x, height), lerp(rMin.y, rMax.y + up.y, height)),
    }
}

export const iterSlotLanes = (
    lane: number,
    size: number,
    pivotLane = 0,
    halfOffset = false,
): number[] => {
    const e = 1e-6
    const offset = halfOffset ? 0 : 0.5
    const shift = pivotLane + offset - 0.5
    const shiftedLane = lane - shift
    const lanes: number[] = []
    for (let i = Math.floor(shiftedLane - size + e); i < Math.ceil(shiftedLane + size - e); i++) {
        lanes.push(i + 0.5 + shift)
    }
    return lanes
}

export const layoutSlideConnectorSegment = (
    startLane: number,
    startSize: number,
    startTravel: number,
    endLane: number,
    endSize: number,
    endTravel: number,
): Quad => {
    if (startTravel < endTravel) {
        ;[startLane, endLane] = [endLane, startLane]
        ;[startSize, endSize] = [endSize, startSize]
        ;[startTravel, endTravel] = [endTravel, startTravel]
    }
    return {
        bl: perspectiveVec(startLane - startSize, 1, startTravel),
        br: perspectiveVec(startLane + startSize, 1, startTravel),
        tl: perspectiveVec(endLane - endSize, 1, endTravel),
        tr: perspectiveVec(endLane + endSize, 1, endTravel),
    }
}
