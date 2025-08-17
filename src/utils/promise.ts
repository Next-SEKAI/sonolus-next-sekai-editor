export const timeout = (ms: number) => new Promise<undefined>((resolve) => setTimeout(resolve, ms))
