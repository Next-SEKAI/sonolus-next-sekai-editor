import type { ZKey } from '../gl'
import type { ArrowSpriteSet, NoteSpriteSet, PreviewSkin, Sprite } from '../skin'
import {
    LAYER_NOTE_ARROW,
    LAYER_NOTE_BODY,
    LAYER_NOTE_FLICK_BODY,
    LAYER_NOTE_SLIM_BODY,
    LAYER_NOTE_TICK,
    getZ,
} from './layer'
import {
    DynamicLayout,
    FlickDirection,
    approach,
    layoutFlickArrow,
    layoutFlickArrowFallback,
    layoutRegularNoteBody,
    layoutRegularNoteBodyFallback,
    layoutSlimNoteBody,
    layoutSlimNoteBodyFallback,
    layoutTick,
    type FlickDirectionValue,
} from './layout'
import { clamp, easeInCubic, transformQuadAffine, type AffineTransform, type Quad } from './math'
import { NoteKind, type NoteKindValue } from './model'

type Draw = (sprite: Sprite | undefined, quad: Quad, z: ZKey, a: number) => void

const isUpDirection = (direction: FlickDirectionValue) =>
    direction === FlickDirection.upOmni ||
    direction === FlickDirection.upLeft ||
    direction === FlickDirection.upRight

export const getNoteSpriteSet = (
    skin: PreviewSkin,
    kind: NoteKindValue,
    isCritical: boolean,
    direction: FlickDirectionValue,
): NoteSpriteSet | undefined => {
    switch (kind) {
        case NoteKind.tap:
            return isCritical ? skin.criticalNote : skin.normalNote
        case NoteKind.flick:
        case NoteKind.headFlick:
        case NoteKind.tailFlick:
            if (isUpDirection(direction)) {
                return isCritical ? skin.criticalFlickNote : skin.flickNote
            }
            return isCritical ? skin.criticalDownFlickNote : skin.downFlickNote
        case NoteKind.trace:
        case NoteKind.headTrace:
        case NoteKind.tailTrace:
            return isCritical ? skin.criticalTraceNote : skin.traceNote
        case NoteKind.traceFlick:
        case NoteKind.headTraceFlick:
        case NoteKind.tailTraceFlick:
            if (isUpDirection(direction)) {
                return isCritical ? skin.criticalTraceFlickNote : skin.traceFlickNote
            }
            return isCritical ? skin.criticalTraceDownFlickNote : skin.traceDownFlickNote
        case NoteKind.release:
        case NoteKind.headTap:
        case NoteKind.headRelease:
        case NoteKind.tailTap:
        case NoteKind.tailRelease:
            return isCritical ? skin.criticalSlideNote : skin.slideNote
        case NoteKind.tick:
            return isCritical ? skin.criticalSlideTickNote : skin.normalSlideTickNote
        case NoteKind.hideTick:
        case NoteKind.anchor:
            return undefined
        case NoteKind.damage:
            return skin.damageNote
    }
}

const flickBodyKinds = new Set<NoteKindValue>([
    NoteKind.flick,
    NoteKind.headFlick,
    NoteKind.tailFlick,
])

const slimBodyKinds = new Set<NoteKindValue>([
    NoteKind.trace,
    NoteKind.traceFlick,
    NoteKind.headTrace,
    NoteKind.headTraceFlick,
    NoteKind.tailTrace,
    NoteKind.tailTraceFlick,
    NoteKind.damage,
])

const getNoteBodyLayer = (kind: NoteKindValue) => {
    if (flickBodyKinds.has(kind)) return LAYER_NOTE_FLICK_BODY
    if (slimBodyKinds.has(kind)) return LAYER_NOTE_SLIM_BODY
    return LAYER_NOTE_BODY
}

export const drawNote = (
    draw: Draw,
    skin: PreviewSkin,
    now: number,
    kind: NoteKindValue,
    isCritical: boolean,
    lane: number,
    size: number,
    visualProgress: number,
    direction: FlickDirectionValue,
    targetTime: number,
    transform: AffineTransform,
    noteAlpha: number,
) => {
    if (
        visualProgress < DynamicLayout.progressStart ||
        visualProgress > DynamicLayout.progressCutoff
    )
        return
    if (noteAlpha <= 0) return

    const travel = approach(visualProgress)
    const spriteSet = getNoteSpriteSet(skin, kind, isCritical, direction)
    if (!spriteSet) return

    drawNoteBody(draw, spriteSet, kind, lane, size, travel, targetTime, transform, noteAlpha)
    drawNoteArrow(
        draw,
        spriteSet.arrow,
        isCritical,
        lane,
        size,
        travel,
        targetTime,
        direction,
        now,
        transform,
        noteAlpha,
    )
    drawNoteTick(draw, spriteSet.tick, lane, travel, targetTime, transform, noteAlpha)
}

export const drawSlideNoteHead = (
    draw: Draw,
    skin: PreviewSkin,
    kind: NoteKindValue,
    isCritical: boolean,
    lane: number,
    size: number,
    targetTime: number,
    visualProgress: number,
    transform: AffineTransform,
    noteAlpha: number,
) => {
    if (noteAlpha <= 0) return

    const travel = approach(visualProgress)
    const spriteSet = getNoteSpriteSet(skin, kind, isCritical, FlickDirection.upOmni)
    if (!spriteSet) return

    drawNoteBody(draw, spriteSet, kind, lane, size, travel, targetTime, transform, noteAlpha)
    drawNoteTick(draw, spriteSet.tick, lane, travel, targetTime, transform, noteAlpha)
}

const drawNoteBody = (
    draw: Draw,
    spriteSet: NoteSpriteSet,
    kind: NoteKindValue,
    lane: number,
    size: number,
    travel: number,
    targetTime: number,
    transform: AffineTransform,
    noteAlpha: number,
) => {
    const body = spriteSet.body
    if (!body.middle) return

    const layer = getNoteBodyLayer(kind)
    const z = getZ(layer, targetTime, lane)

    switch (body.renderType) {
        case 'normal': {
            const [left, middle, right] = layoutRegularNoteBody(lane, size, travel)
            draw(body.left, transformQuadAffine(transform, left), z, Math.min(noteAlpha, 1))
            draw(body.middle, transformQuadAffine(transform, middle), z, Math.min(noteAlpha, 1))
            draw(body.right, transformQuadAffine(transform, right), z, Math.min(noteAlpha, 1))
            break
        }
        case 'slim': {
            const [left, middle, right] = layoutSlimNoteBody(lane, size, travel)
            draw(body.left, transformQuadAffine(transform, left), z, Math.min(noteAlpha, 1))
            draw(body.middle, transformQuadAffine(transform, middle), z, Math.min(noteAlpha, 1))
            draw(body.right, transformQuadAffine(transform, right), z, Math.min(noteAlpha, 1))
            break
        }
        case 'normalFallback': {
            const layout = layoutRegularNoteBodyFallback(lane, size, travel)
            draw(body.middle, transformQuadAffine(transform, layout), z, Math.min(noteAlpha, 1))
            break
        }
        case 'slimFallback': {
            const layout = layoutSlimNoteBodyFallback(lane, size, travel)
            draw(body.middle, transformQuadAffine(transform, layout), z, Math.min(noteAlpha, 1))
            break
        }
    }
}

const drawNoteTick = (
    draw: Draw,
    sprite: Sprite | undefined,
    lane: number,
    travel: number,
    targetTime: number,
    transform: AffineTransform,
    noteAlpha: number,
) => {
    if (!sprite) return

    const z = getZ(LAYER_NOTE_TICK, targetTime, lane)
    draw(
        sprite,
        transformQuadAffine(transform, layoutTick(lane, travel)),
        z,
        Math.min(noteAlpha, 1),
    )
}

const getArrowSprite = (
    arrow: ArrowSpriteSet,
    size: number,
    direction: FlickDirectionValue,
): Sprite | undefined => {
    if (arrow.fallback) return arrow.up[0]

    const index = clamp(Math.round(size * 2), 1, 6) - 1
    switch (direction) {
        case FlickDirection.upOmni:
            return arrow.up[index]
        case FlickDirection.downOmni:
            return arrow.down[index]
        case FlickDirection.upLeft:
        case FlickDirection.upRight:
            return arrow.upLeft[index]
        case FlickDirection.downLeft:
        case FlickDirection.downRight:
            return arrow.downLeft[index]
    }
}

const drawNoteArrow = (
    draw: Draw,
    arrow: ArrowSpriteSet,
    isCritical: boolean,
    lane: number,
    size: number,
    travel: number,
    targetTime: number,
    direction: FlickDirectionValue,
    now: number,
    transform: AffineTransform,
    noteAlpha: number,
) => {
    const sprite = getArrowSprite(arrow, size, direction)
    if (!sprite) return

    const period = 0.5
    const animationProgress = (((now / period) % 1) + 1) % 1
    const a = Math.min((1 - easeInCubic(animationProgress)) * noteAlpha, 1)
    const z = getZ(LAYER_NOTE_ARROW, targetTime, lane, direction + (isCritical ? 0 : 6))

    const layout = arrow.fallback
        ? layoutFlickArrowFallback(lane, size, direction, travel, animationProgress)
        : layoutFlickArrow(lane, size, direction, travel, animationProgress)

    draw(sprite, transformQuadAffine(transform, layout), z, a)
}
