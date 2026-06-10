import { Type } from '@sinclair/typebox'
import { getOptionalRef, getValue, type ParseCtx } from '.'

export const parseStagesToChart = ({ entities, addStage }: ParseCtx) => {
    for (const entity of entities) {
        if (entity.archetype !== 'Stage') continue

        addStage(entity.name, getOptionalRef(entity, 'editorName'), {
            isFromStart: !!getValue(entity, 'fromStart', fromStartSchema),
            isUntilEnd: !!getValue(entity, 'untilEnd', untilEndSchema),
        })
    }
}

const fromStartSchema = Type.Number()

const untilEndSchema = Type.Number()
