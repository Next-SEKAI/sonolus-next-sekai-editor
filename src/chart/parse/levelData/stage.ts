import Type from 'typebox'
import { getOptionalRef, getOptionalValue, getValue, type ParseCtx } from '.'
import type { StageId } from '../../stages'

export const parseStagesToChart = ({ entities, addStage }: ParseCtx) => {
    const firstMaskRefs = new Map<StageId, string>()
    const firstPivotRefs = new Map<StageId, string>()
    const firstStyleRefs = new Map<StageId, string>()
    const firstTransformRefs = new Map<StageId, string>()

    for (const entity of entities) {
        if (entity.archetype !== 'Stage') continue

        const id = addStage(entity.name, getOptionalRef(entity, 'editorName'), {
            isFromStart: !!getValue(entity, 'fromStart', fromStartSchema),
            isUntilEnd: !!getValue(entity, 'untilEnd', untilEndSchema),
            generateSimLines:
                generateSimLines[
                    getOptionalValue(entity, 'generateSimLines', generateSimLinesSchema) ?? 0
                ],
        })

        const addRef = (refs: Map<StageId, string>, name: string) => {
            const ref = getOptionalRef(entity, name)
            if (!ref) return

            refs.set(id, ref)
        }

        addRef(firstMaskRefs, 'firstMaskChange')
        addRef(firstPivotRefs, 'firstPivotChange')
        addRef(firstStyleRefs, 'firstStyleChange')
        addRef(firstTransformRefs, 'firstTransformChange')
    }

    return {
        firstMaskRefs,
        firstPivotRefs,
        firstStyleRefs,
        firstTransformRefs,
    }
}

const fromStartSchema = Type.Number()

const untilEndSchema = Type.Number()

const generateSimLinesSchema = Type.Union([Type.Literal(0), Type.Literal(1)])

const generateSimLines = {
    0: 'global',
    1: 'isolated',
} as const
