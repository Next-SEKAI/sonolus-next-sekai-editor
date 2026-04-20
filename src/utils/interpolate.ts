export const interpolate =
    (message: () => string, ...params: (string | (() => string))[]) =>
    () =>
        params.reduce<string>(
            (message, param, index) =>
                message.replace(`{${index}}`, typeof param === 'string' ? param : param()),
            message(),
        )

export const interpolateRaw = (message: string, ...params: string[]) =>
    params.reduce((message, param, index) => message.replace(`{${index}}`, param), message)
