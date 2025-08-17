import { computed } from 'vue'

export type Range<T> = {
    min: T
    max: T
}

export const computedRange = (getter: () => Range<number>) =>
    computed<Range<number>>((oldValue) => {
        const value = getter()

        return value.min === oldValue?.min && value.max === oldValue.max ? oldValue : value
    })
