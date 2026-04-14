import { computed, type Ref } from 'vue'
import { selectedEntities } from '../../history/selectedEntities'
import type { Entity, EntityType } from '../../state/entities'
import { entries } from '../../utils/object'
import { editSelectedEditableEntities, type EditableObject } from '../sidebars/default'
import { getNoteFields, type NoteFields } from './noteFields'

export const useProperties =
    <T>(ref: Ref<T>) =>
    <K extends keyof T>(key: K) =>
        computed({
            get: () => ref.value[key],
            set: (value) => {
                const properties = { ...ref.value }
                if (value === undefined) {
                    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                    delete properties[key]
                } else {
                    properties[key] = value
                }
                ref.value = properties
            },
        })

export const useSelectedEntitiesProperties = <T extends Entity>(
    filter: (entity: Entity) => entity is T,
) => {
    const entities = computed(() => selectedEntities.value.filter(filter))

    const state = computed(() => {
        const model: Partial<T & EditableObject> = {}
        const types: Partial<Record<EntityType, boolean>> = {}
        const noteFields: Partial<NoteFields> = {}

        for (const entity of entities.value) {
            aggregate(model, entity)

            types[entity.type] = true

            if (entity.type === 'note') aggregate(noteFields, getNoteFields(entity))
        }

        return {
            model,
            types,
            noteFields,
        }
    })

    return {
        entities,
        types: computed(() => state.value.types),
        noteFields: computed(() => state.value.noteFields),
        createModel: <K extends DistributedKeyOf<T> & keyof EditableObject>(key: K) =>
            computed({
                get: () => state.value.model[key],
                set: (value) => {
                    if (value === undefined) return

                    editSelectedEditableEntities({ [key]: value })
                },
            }),
    }
}

type DistributedKeyOf<T> = T extends T ? keyof T : never

const aggregate = <T extends object>(aggregate: Partial<T>, object: T) => {
    for (const [key, value] of entries(object)) {
        if (key in aggregate) {
            if (aggregate[key] === undefined) continue

            if (aggregate[key] !== value) {
                aggregate[key] = undefined
            }
        } else {
            aggregate[key] = value
        }
    }
}
