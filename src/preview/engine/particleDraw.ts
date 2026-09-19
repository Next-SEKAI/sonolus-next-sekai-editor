import type { PreviewRenderer, ZKey } from '../gl'
import type { ParticleEffect, ParticleExpression, ParticleProperty } from '../particle'
import { clamp, lerp, lerpVec, unlerp, vec, type Quad, type Vec } from './math'

export const PARTICLE_LAYER = 100

export const LANE_PARTICLE_LAYER = 3

const mulberry32 = (seed: number) => {
    let state = seed | 0
    return () => {
        state = (state + 0x6d2b79f5) | 0
        let t = Math.imul(state ^ (state >>> 15), 1 | state)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

export const hashSeed = (...values: number[]) => {
    let hash = 0x811c9dc5
    for (const value of values) {
        hash = Math.imul(hash ^ (value | 0), 0x01000193)
        hash = Math.imul(hash ^ Math.round(value * 1021), 0x01000193)
    }
    return hash | 0
}

type Values = Partial<Record<string, number>>

const buildRandomValues = (rng: () => number): Values => {
    const values: Values = { c: 1 }
    for (let i = 1; i <= 8; i++) {
        const r = rng()
        values[`r${i}`] = r
        values[`sinr${i}`] = Math.sin(2 * Math.PI * r)
        values[`cosr${i}`] = Math.cos(2 * Math.PI * r)
    }
    return values
}

const evaluate = (expression: ParticleExpression, values: Values) => {
    let sum = 0
    for (const [key, coefficient] of Object.entries(expression)) {
        if (!coefficient) continue
        sum += coefficient * (values[key] ?? 0)
    }
    return sum
}

const evaluateProperty = (property: ParticleProperty, values: Values) => ({
    from: evaluate(property.from, values),
    to: evaluate(property.to, values),
    ease: property.ease,
})

const easeValue = (ease: string, x: number): number => {
    const easing = easings[ease]
    return easing ? easing(x) : x
}

export const drawParticleEffect = (
    draw: PreviewRenderer['draw'],
    effect: ParticleEffect,
    layout: Quad,
    progress: number,
    loop: boolean,
    seed: number,
    z: ZKey,
) => {
    const spawnRng = mulberry32(seed)
    const spawnValues = buildRandomValues(spawnRng)

    let rect = layout
    if (effect.transform) {
        const inputs: Values = {
            ...spawnValues,
            x1: layout.bl.x,
            x2: layout.tl.x,
            x3: layout.tr.x,
            x4: layout.br.x,
            y1: layout.bl.y,
            y2: layout.tl.y,
            y3: layout.tr.y,
            y4: layout.br.y,
        }
        rect = {
            bl: vec(
                evaluate(effect.transform.x1 ?? {}, inputs),
                evaluate(effect.transform.y1 ?? {}, inputs),
            ),
            tl: vec(
                evaluate(effect.transform.x2 ?? {}, inputs),
                evaluate(effect.transform.y2 ?? {}, inputs),
            ),
            tr: vec(
                evaluate(effect.transform.x3 ?? {}, inputs),
                evaluate(effect.transform.y3 ?? {}, inputs),
            ),
            br: vec(
                evaluate(effect.transform.x4 ?? {}, inputs),
                evaluate(effect.transform.y4 ?? {}, inputs),
            ),
        }
    }

    for (const [groupIndex, group] of effect.groups.entries()) {
        for (let occurrence = 0; occurrence < group.count; occurrence++) {
            const values = buildRandomValues(
                mulberry32(hashSeed(seed, groupIndex * 131 + occurrence)),
            )

            for (const particle of group.particles) {
                if (!particle.sprite) continue

                let p = progress
                if (loop && p < particle.start) p++
                const end = particle.start + particle.duration
                if (p < particle.start || p > end) continue

                const frac = particle.duration > 0 ? unlerp(particle.start, end, p) : 1

                const x = evaluateAnimated(particle.x, values, frac)
                const y = evaluateAnimated(particle.y, values, frac)
                const w = evaluateAnimated(particle.w, values, frac)
                const h = evaluateAnimated(particle.h, values, frac)
                const r = evaluateAnimated(particle.r, values, frac)
                const a = clamp(evaluateAnimated(particle.a, values, frac), 0, 1)
                if (a <= 0) continue

                const cosr = Math.cos(r)
                const sinr = Math.sin(r)

                draw(
                    particle.sprite,
                    {
                        bl: particlePoint(rect, x, y, w, h, cosr, sinr, -1, -1),
                        tl: particlePoint(rect, x, y, w, h, cosr, sinr, -1, 1),
                        tr: particlePoint(rect, x, y, w, h, cosr, sinr, 1, 1),
                        br: particlePoint(rect, x, y, w, h, cosr, sinr, 1, -1),
                    },
                    z,
                    a,
                    particle.tint,
                )
            }
        }
    }
}

const evaluateAnimated = (property: ParticleProperty, values: Values, frac: number) => {
    const { from, to, ease } = evaluateProperty(property, values)
    return lerp(from, to, easeValue(ease, frac))
}

const particlePoint = (
    rect: Quad,
    x: number,
    y: number,
    w: number,
    h: number,
    cosr: number,
    sinr: number,
    sx: number,
    sy: number,
): Vec => {
    const dx = sx * w * cosr - sy * h * sinr
    const dy = sy * h * cosr + sx * w * sinr

    const px = (x + dx + 1) / 2
    const py = (y + dy + 1) / 2

    const b = lerpVec(rect.bl, rect.br, px)
    const t = lerpVec(rect.tl, rect.tr, px)
    return lerpVec(b, t, py)
}

const easings: Partial<Record<string, (x: number) => number>> = {
    linear: (x) => x,
    none: (x) => (x === 1 ? 1 : 0),

    inSine: (x) => 1 - Math.cos((x * Math.PI) / 2),
    outSine: (x) => Math.sin((x * Math.PI) / 2),
    inOutSine: (x) => -(Math.cos(x * Math.PI) - 1) / 2,
    outInSine: (x) =>
        x < 0.5 ? Math.sin(x * Math.PI) / 2 : 1 - 0.5 * Math.cos((x - 0.5) * Math.PI),

    inQuad: (x) => x ** 2,
    outQuad: (x) => 1 - (1 - x) ** 2,
    inOutQuad: (x) => (x < 0.5 ? 2 * x ** 2 : 1 - (-2 * x + 2) ** 2 / 2),
    outInQuad: (x) => (x < 0.5 ? 0.5 - 0.5 * (1 - 2 * x) ** 2 : 0.5 + 0.5 * (2 * x - 1) ** 2),

    inCubic: (x) => x ** 3,
    outCubic: (x) => 1 - (1 - x) ** 3,
    inOutCubic: (x) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2),
    outInCubic: (x) => (x < 0.5 ? 0.5 - 0.5 * (1 - 2 * x) ** 3 : 0.5 + 0.5 * (2 * x - 1) ** 3),

    inQuart: (x) => x ** 4,
    outQuart: (x) => 1 - (1 - x) ** 4,
    inOutQuart: (x) => (x < 0.5 ? 8 * x ** 4 : 1 - (-2 * x + 2) ** 4 / 2),
    outInQuart: (x) => (x < 0.5 ? 0.5 - 0.5 * (1 - 2 * x) ** 4 : 0.5 + 0.5 * (2 * x - 1) ** 4),

    inQuint: (x) => x ** 5,
    outQuint: (x) => 1 - (1 - x) ** 5,
    inOutQuint: (x) => (x < 0.5 ? 16 * x ** 5 : 1 - (-2 * x + 2) ** 5 / 2),
    outInQuint: (x) => (x < 0.5 ? 0.5 - 0.5 * (1 - 2 * x) ** 5 : 0.5 + 0.5 * (2 * x - 1) ** 5),

    inExpo: (x) => (x === 0 ? 0 : 2 ** (10 * x - 10)),
    outExpo: (x) => (x === 1 ? 1 : 1 - 2 ** (-10 * x)),
    inOutExpo: (x) =>
        x === 0
            ? 0
            : x === 1
              ? 1
              : x < 0.5
                ? 0.5 * 2 ** (20 * x - 10)
                : 1 - 0.5 * 2 ** (-20 * x + 10),
    outInExpo: (x) =>
        x === 0
            ? 0
            : x === 1
              ? 1
              : x < 0.5
                ? 0.5 - 0.5 * 2 ** (-20 * x)
                : 0.5 + 0.5 * 2 ** (20 * x - 20),

    inCirc: (x) => 1 - Math.sqrt(1 - x ** 2),
    outCirc: (x) => Math.sqrt(1 - (x - 1) ** 2),
    inOutCirc: (x) =>
        x < 0.5
            ? 0.5 - 0.5 * Math.sqrt(1 - 4 * x ** 2)
            : 0.5 + 0.5 * Math.sqrt(1 - (-2 * x + 2) ** 2),
    outInCirc: (x) =>
        x < 0.5 ? 0.5 * Math.sqrt(1 - (2 * x - 1) ** 2) : 1 - 0.5 * Math.sqrt(1 - (2 * x - 1) ** 2),

    inBack: (x) => 2.70158 * x ** 3 - 1.70158 * x ** 2,
    outBack: (x) => 1 + 2.70158 * (x - 1) ** 3 + 1.70158 * (x - 1) ** 2,
    inOutBack: (x) =>
        x < 0.5
            ? 4 * 2.70158 * x ** 3 - 2 * 1.70158 * x ** 2
            : 1 + 0.5 * 2.70158 * (2 * x - 2) ** 3 + 0.5 * 1.70158 * (2 * x - 2) ** 2,
    outInBack: (x) =>
        x < 0.5
            ? 0.5 + 0.5 * 2.70158 * (2 * x - 1) ** 3 + 0.5 * 1.70158 * (2 * x - 1) ** 2
            : 0.5 + 0.5 * 2.70158 * (2 * x - 1) ** 3 - 0.5 * 1.70158 * (2 * x - 1) ** 2,

    inElastic: (x) =>
        x === 0
            ? 0
            : x === 1
              ? 1
              : -(2 ** (10 * x - 10)) * Math.sin(((x * 10 - 10.75) * 2 * Math.PI) / 3),
    outElastic: (x) =>
        x === 0
            ? 0
            : x === 1
              ? 1
              : 2 ** (-10 * x) * Math.sin(((x * 10 - 0.75) * 2 * Math.PI) / 3) + 1,
    inOutElastic: (x) =>
        x === 0
            ? 0
            : x === 1
              ? 1
              : x < 0.5
                ? -(2 ** (20 * x - 10)) * Math.sin(((20 * x - 10.75) * 2 * Math.PI) / 3) * 0.5
                : 1 + 2 ** (-20 * x + 10) * Math.sin(((20 * x - 10.75) * 2 * Math.PI) / 3) * 0.5,
    outInElastic: (x) =>
        x === 0
            ? 0
            : x === 1
              ? 1
              : x < 0.5
                ? 0.5 * 2 ** (-20 * x) * Math.sin(((x * 20 - 0.75) * 2 * Math.PI) / 3) + 0.5
                : 0.5 -
                  0.5 *
                      2 ** (10 * (2 * x - 1) - 10) *
                      Math.sin((((2 * x - 1) * 10 - 10.75) * 2 * Math.PI) / 3),
}
