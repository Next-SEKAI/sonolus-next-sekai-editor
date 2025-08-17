export const interpolate =
    (message: () => string, ...params: (string | (() => string))[]) =>
    () =>
        params.reduce<string>(
            (message, param, index) =>
                message.replace(`{${index}}`, typeof param === 'string' ? param : param()),
            message(),
        )
