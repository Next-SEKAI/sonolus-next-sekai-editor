export type Ease = 'out' | 'linear' | 'in'

export const easeValue = (value: number, ease: Ease) => {
    switch (ease) {
        case 'in':
            return value ** 2
        case 'out':
            return 1 - (1 - value) ** 2
        case 'linear':
            return value
    }
}

export const easeCurve = (sMin: number, sMax: number, ease: Ease) => {
    switch (ease) {
        case 'in':
            return sMin * sMax
        case 'out':
            return 1 - (1 - sMin) * (1 - sMax)
        case 'linear':
            return (sMin + sMax) / 2
    }
}
