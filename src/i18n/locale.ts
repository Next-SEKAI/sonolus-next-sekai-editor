export const defaultLocale = (() => {
    const [main, ...rest] = navigator.language.toLowerCase().split('-')

    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
    switch (main) {
        case 'fr':
        case 'ja':
        case 'tr':
            return main
        case 'zh':
            return ['hant', 'hk', 'tw'].some((tag) => rest.includes(tag)) ? 'zht' : 'zhs'
        default:
            return 'en'
    }
})()
