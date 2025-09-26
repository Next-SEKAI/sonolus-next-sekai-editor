export const defaultLocale = (() => {
    const [main] = navigator.language.toLowerCase().split('-')

    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
    switch (main) {
        case 'fr':
        case 'ja':
        case 'tr':
            return main
        case 'zh':
            return 'zhs'
        default:
            return 'en'
    }
})()
