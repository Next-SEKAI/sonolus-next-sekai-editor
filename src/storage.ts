import { name } from '../package.json'

export const storageGet = (key: string, defaultValue: unknown): unknown => {
    try {
        const value = localStorage.getItem(`${name}.${key}`)
        if (value === null) return defaultValue

        return JSON.parse(value)
    } catch {
        return defaultValue
    }
}

export const storageSet = (key: string, value: unknown) => {
    localStorage.setItem(`${name}.${key}`, JSON.stringify(value))
}

export const storageRemove = (key: string) => {
    localStorage.removeItem(`${name}.${key}`)
}
