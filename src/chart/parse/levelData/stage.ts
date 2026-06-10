import { Type } from '@sinclair/typebox'
import { getOptionalRef, getValue, type ParseCtx } from '.'
import type { StageId } from '../../stages'

export const parseStagesToChart = ({ entities, addStage }: ParseCtx) => {
    const firstMaskRefs = new Map<StageId, string>()
    const firstPivotRefs = new Map<StageId, string>()

    for (const entity of entities) {
        if (entity.archetype !== 'Stage') continue

        const id = addStage(entity.name, getOptionalRef(entity, 'editorName'), {
            isFromStart: !!getValue(entity, 'fromStart', fromStartSchema),
            isUntilEnd: !!getValue(entity, 'untilEnd', untilEndSchema),
        })

        const addRef = (refs: Map<StageId, string>, name: string) => {
            const ref = getOptionalRef(entity, name)
            if (!ref) return

            refs.set(id, ref)
        }

        addRef(firstMaskRefs, 'firstMaskChange')
        addRef(firstPivotRefs, 'firstPivotChange')
    }

    return {
        firstMaskRefs,
        firstPivotRefs,
    }
}

const fromStartSchema = Type.Number()

const untilEndSchema = Type.Number()
