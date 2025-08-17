export const defaultLocale = (() => {
    const [main] = navigator.language.toLowerCase().split('-')

    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
    switch (main) {
        default:
            return 'en'
    }
})()
