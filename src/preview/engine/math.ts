export type Vec = {
    x: number
    y: number
}

export type Quad = {
    bl: Vec
    tl: Vec
    tr: Vec
    br: Vec
}

export const vec = (x: number, y: number): Vec => ({ x, y })

export const addVec = (a: Vec, b: Vec): Vec => ({ x: a.x + b.x, y: a.y + b.y })

export const subVec = (a: Vec, b: Vec): Vec => ({ x: a.x - b.x, y: a.y - b.y })

export const scaleVec = (a: Vec, s: number): Vec => ({ x: a.x * s, y: a.y * s })

export const lerpVec = (a: Vec, b: Vec, t: number): Vec => ({
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
})

export const rotateVec = (v: Vec, a: number): Vec => {
    const c = Math.cos(a)
    const s = Math.sin(a)

    return {
        x: v.x * c - v.y * s,
        y: v.x * s + v.y * c,
    }
}

export const orthogonalVec = (v: Vec): Vec => ({ x: -v.y, y: v.x })

export const normalizeVecOrZero = (v: Vec): Vec => {
    const m = Math.hypot(v.x, v.y)
    if (!m) return { x: 0, y: 0 }

    return { x: v.x / m, y: v.y / m }
}

export const dotVec = (a: Vec, b: Vec) => a.x * b.x + a.y * b.y

export const translateQuad = (q: Quad, offset: Vec): Quad => ({
    bl: addVec(q.bl, offset),
    tl: addVec(q.tl, offset),
    tr: addVec(q.tr, offset),
    br: addVec(q.br, offset),
})

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export const unlerp = (a: number, b: number, x: number) => (a === b ? 0 : (x - a) / (b - a))

export const clamp = (x: number, min: number, max: number) => Math.min(Math.max(x, min), max)

export const unlerpClamped = (a: number, b: number, x: number) => clamp(unlerp(a, b, x), 0, 1)

export const remap = (a: number, b: number, c: number, d: number, x: number) =>
    lerp(c, d, unlerp(a, b, x))

export const remapClamped = (a: number, b: number, c: number, d: number, x: number) =>
    lerp(c, d, unlerpClamped(a, b, x))

export const EaseType = {
    none: 0,
    linear: 1,
    inQuad: 2,
    outQuad: 3,
    inOutQuad: 4,
    outInQuad: 5,
} as const

export type EaseTypeValue = (typeof EaseType)[keyof typeof EaseType]

export const ease = (easeType: EaseTypeValue, x: number): number => {
    switch (easeType) {
        case EaseType.none:
            return x <= 1 ? 0 : 1
        case EaseType.linear:
            return clamp(x, 0, 1)
        case EaseType.inQuad: {
            const t = clamp(x, 0, 1)
            return t * t
        }
        case EaseType.outQuad: {
            const t = clamp(x, 0, 1)
            return 1 - (1 - t) * (1 - t)
        }
        case EaseType.inOutQuad: {
            const t = clamp(x, 0, 1)
            return t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t)
        }
        case EaseType.outInQuad: {
            const t = clamp(x, 0, 1)
            return t < 0.5
                ? ease(EaseType.outQuad, 2 * t) / 2
                : 0.5 + ease(EaseType.inQuad, 2 * t - 1) / 2
        }
    }
}

export const easeOutCubic = (x: number) => {
    const t = clamp(x, 0, 1)
    return 1 - (1 - t) ** 3
}

export const easeInCubic = (x: number) => {
    const t = clamp(x, 0, 1)
    return t ** 3
}

export type AffineTransform = {
    a00: number
    a01: number
    a02: number
    a10: number
    a11: number
    a12: number
}

export const identityAffineTransform: AffineTransform = {
    a00: 1,
    a01: 0,
    a02: 0,
    a10: 0,
    a11: 1,
    a12: 0,
}

export const applyAffine = (t: AffineTransform, p: Vec): Vec => ({
    x: t.a00 * p.x + t.a01 * p.y + t.a02,
    y: t.a10 * p.x + t.a11 * p.y + t.a12,
})

export const transformQuadAffine = (t: AffineTransform, q: Quad): Quad =>
    t === identityAffineTransform
        ? q
        : {
              bl: applyAffine(t, q.bl),
              tl: applyAffine(t, q.tl),
              tr: applyAffine(t, q.tr),
              br: applyAffine(t, q.br),
          }
