export const entries = Object.entries as <T extends object>(
    object: T,
) => { [K in keyof T]-?: [K, T[K]] }[keyof T][]
