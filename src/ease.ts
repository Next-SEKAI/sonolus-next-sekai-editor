export type Ease = 'linear' | 'in' | 'out' | 'inOut' | 'outIn' | 'none'

export const ease = (type: Ease, x: number) => {
    switch (type) {
        case 'linear':
            return x
        case 'in':
            return x * x
        case 'out':
            return 1 - (1 - x) * (1 - x)
        case 'inOut':
            return x < 0.5 ? 2 * x * x : 1 - ((-2 * x + 2) * (-2 * x + 2)) / 2
        case 'outIn':
            return x < 0.5
                ? 0.5 - 0.5 * (1 - 2 * x) * (1 - 2 * x)
                : 0.5 + 0.5 * (2 * x - 1) * (2 * x - 1)
        case 'none':
            return 0
    }
}
