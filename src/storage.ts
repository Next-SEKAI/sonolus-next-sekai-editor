import { name } from '../package.json'

export const storageGet = (key: string): unknown => {
    try {
        return JSON.parse(localStorage.getItem(`${name}.${key}`) ?? 'null')
    } catch {
        return null
    }
}

export const storageSet = (key: string, value: unknown) => {
    localStorage.setItem(`${name}.${key}`, JSON.stringify(value))
}

export const storageRemove = (key: string) => {
    localStorage.removeItem(`${name}.${key}`)
}
