import { Type } from '@sinclair/typebox'
import { getOptionalRef, getOptionalValue, type ParseCtx } from '.'

export const parseGroupsToChart = ({ entities, addGroup }: ParseCtx) => {
    for (const entity of entities) {
        if (entity.archetype !== '#TIMESCALE_GROUP') continue

        addGroup(entity.name, getOptionalRef(entity, 'editorName'), {
            forceNoteSpeed: getOptionalValue(entity, 'forceNoteSpeed', forceNoteSpeedSchema),
        })
    }
}

const forceNoteSpeedSchema = Type.Number({ minimum: 1, maximum: 12 })
