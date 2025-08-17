export const mod = (x: number, y: number) => {
    const result = x % y
    return result < 0 ? result + y : result
}

export const clamp = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max)

export const lerp = (x: number, y: number, s: number) => x + s * (y - x)

export const unlerp = (a: number, b: number, x: number) => (x - a) / (b - a)

export const remap = (a: number, b: number, c: number, d: number, x: number) =>
    lerp(c, d, unlerp(a, b, x))

export const align = (value: number, division = 1) => Math.round(value * division) / division
