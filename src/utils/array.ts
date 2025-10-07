import { computed } from 'vue'

export const computedArray = <T>(getter: () => T[]) =>
    computed<T[]>((oldValues) => {
        const values = getter()

        if (values.length !== oldValues?.length) return values
        if (values.some((value, i) => value !== oldValues[i])) return values

        return oldValues
    })
