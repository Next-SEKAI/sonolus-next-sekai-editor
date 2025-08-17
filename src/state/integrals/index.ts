import { bisect } from '../../utils/ordered'

export type Integral = {
    x: number
    y: number
    s: number
}

export const integrate = <T extends Integral>(integrals: T[]) => {
    let x = 0
    let y = 0
    let s = 0

    return integrals.map((integral): T => {
        y += (integral.x - x) * s
        x = integral.x
        s = integral.s

        return {
            ...integral,
            x,
            y,
            s,
        }
    })
}

export const findIntegral = <T extends Integral>(integrals: T[], key: 'x' | 'y', value: number) => {
    const index = bisect(integrals, key, value)

    const integral = integrals[integrals[index]?.[key] === value ? index : index - 1]
    if (!integral) throw new Error('Unexpected integral not found')

    return integral
}
