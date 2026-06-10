export type Stages = Map<StageId, StageObject>

declare const idBrand: unique symbol

export type StageId = number & { [idBrand]: never }

export type GenerateSimLines = 'global' | 'isolated'

export type StageObject = {
    name: string
    isFromStart: boolean
    isUntilEnd: boolean
    generateSimLines: GenerateSimLines
}

let i = 1

export const addToStages = (
    stages: Stages,
    name?: string,
    object: Omit<StageObject, 'name'> = {
        isFromStart: false,
        isUntilEnd: false,
        generateSimLines: 'global',
    },
) => {
    const id = i++ as StageId
    name ??= `#${
        Math.max(
            0,
            ...[...stages.values()]
                .map(({ name }) => (name.startsWith('#') ? +name.slice(1) : 0))
                .filter(Number.isInteger),
        ) + 1
    }`

    stages.set(id, {
        name,
        ...object,
    })

    return [id, name] as const
}

export const addDefaultStageToStages = (stages: Stages) =>
    addToStages(stages, undefined, {
        isFromStart: true,
        isUntilEnd: true,
        generateSimLines: 'global',
    })
