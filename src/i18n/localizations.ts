type Localization = {
    [key: string]: string | Localization
}

const modules: Record<string, Localization> = import.meta.glob('./*/index.json', {
    eager: true,
    import: 'default',
})

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const en = modules['./en/index.json']!

const merge = (en: Localization, other: Localization): Localization =>
    Object.fromEntries(
        Object.entries(en).map(([key, value]) => {
            const otherValue = other[key]

            return [
                key,
                typeof value === 'string'
                    ? typeof otherValue === 'string'
                        ? otherValue
                        : value
                    : typeof otherValue === 'object'
                      ? merge(value, otherValue)
                      : value,
            ]
        }),
    )

export const localizations = Object.fromEntries(
    Object.entries(modules).map(([path, localization]) => [
        path.split('/')[1],
        path === './en/index.json' ? localization : merge(en, localization),
    ]),
) as Record<string, typeof import('./en/index.json')>
