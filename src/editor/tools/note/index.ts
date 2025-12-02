import { computed, ref } from 'vue'
import type { Tool } from '..'
import type { NoteObject } from '../../../chart'
import { pushState, replaceState, state } from '../../../history'
import { selectedEntities } from '../../../history/selectedEntities'
import { i18n } from '../../../i18n'
import { showModal } from '../../../modals'
import { settings, type DefaultNoteSlideProperties } from '../../../settings'
import type { Entity } from '../../../state/entities'
import { createSlideId } from '../../../state/entities/slides'
import { toNoteEntity, type NoteEntity } from '../../../state/entities/slides/note'
import { addNote, replaceNote } from '../../../state/mutations/slides/note'
import { createTransaction, type Transaction } from '../../../state/transaction'
import { interpolate } from '../../../utils/interpolate'
import { notify } from '../../notification'
import { isSidebarVisible } from '../../sidebars'
import { quickEdit } from '../../utils/quickEdit'
import {
    focusViewAtBeat,
    setViewHover,
    snapYToBeat,
    view,
    xToLane,
    xToValidLane,
    yToValidBeat,
} from '../../view'
import { hitEntitiesAtPoint, modifyEntities } from '../utils'
import NotePropertiesModal from './NotePropertiesModal.vue'
import NoteSidebar from './NoteSidebar.vue'

export const defaultNotePropertiesPresetIndex = ref(0)

export const setDefaultNotePropertiesPreset = (properties: DefaultNoteSlideProperties) => {
    settings.defaultNotePropertiesPresets = settings.defaultNotePropertiesPresets.map(
        (preset, i) => (i === defaultNotePropertiesPresetIndex.value ? properties : preset),
    )
}

export const defaultNoteProperties = computed(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    () => settings.defaultNotePropertiesPresets[defaultNotePropertiesPresetIndex.value]!,
)

let active:
    | {
          type: 'add'
          lane: number
      }
    | {
          type: 'edit'
          entity: NoteEntity
          lane: number
      }
    | {
          type: 'move'
          entity: NoteEntity
          lane: number
      }
    | undefined

export const note: Tool = {
    sidebar: NoteSidebar,

    hover(x, y, modifiers) {
        const [entity, beat, lane] = tryFind(x, y)
        if (entity) {
            view.entities = {
                hovered: modifyEntities([entity], modifiers),
                creating: [],
            }
        } else {
            view.entities = {
                hovered: [],
                creating: [
                    toNoteEntity(createSlideId(), {
                        group: view.group ?? 0,
                        beat,
                        left: lane,
                        ...getPropertiesFromSelection(),
                    }),
                ],
            }
        }
    },

    tap(x, y, modifiers) {
        const [entity, beat, lane] = tryFind(x, y)
        if (entity) {
            const entities = modifyEntities([entity], modifiers)

            if (modifiers.ctrl) {
                const selectedNoteEntities: Entity[] = selectedEntities.value.filter(
                    (entity) => entity.type === 'note',
                )

                const targets = entities.every((entity) => selectedNoteEntities.includes(entity))
                    ? selectedNoteEntities.filter((entity) => !entities.includes(entity))
                    : [...new Set([...selectedNoteEntities, ...entities])]

                replaceState({
                    ...state.value,
                    selectedEntities: targets,
                })
                view.entities = {
                    hovered: [],
                    creating: [],
                }
                focusViewAtBeat(entity.beat)

                notify(interpolate(() => i18n.value.tools.note.selected, `${targets.length}`))
            } else {
                if (entities.every((entity) => selectedEntities.value.includes(entity))) {
                    focusViewAtBeat(entity.beat)

                    if (isSidebarVisible.value) {
                        quickEdit(defaultNoteProperties.value)
                    } else {
                        void showModal(NotePropertiesModal, {})
                    }
                } else {
                    replaceState({
                        ...state.value,
                        selectedEntities: entities,
                    })
                    view.entities = {
                        hovered: [],
                        creating: [],
                    }
                    focusViewAtBeat(entity.beat)

                    notify(interpolate(() => i18n.value.tools.note.selected, `${entities.length}`))
                }
            }
        } else {
            add({
                group: view.group ?? 0,
                beat,
                left: lane,
                ...getPropertiesFromSelection(),
            })
            focusViewAtBeat(beat)
        }
    },

    dragStart(x, y) {
        const [entity, beat, lane] = tryFind(x, y)
        if (entity) {
            replaceState({
                ...state.value,
                selectedEntities: [entity],
            })
            view.entities = {
                hovered: [],
                creating: [],
            }
            focusViewAtBeat(entity.beat)

            const lane = xToLane(x)
            if (lane > entity.left + 0.5 && lane < entity.left + entity.size - 0.5) {
                notify(interpolate(() => i18n.value.tools.note.moving, '1'))

                active = {
                    type: 'move',
                    entity,
                    lane: xToValidLane(x),
                }
            } else {
                notify(interpolate(() => i18n.value.tools.note.editing, '1'))

                active = {
                    type: 'edit',
                    entity,
                    lane:
                        lane > entity.left + entity.size / 2
                            ? entity.left
                            : entity.left + entity.size - 1,
                }
            }
        } else {
            focusViewAtBeat(beat)

            notify(interpolate(() => i18n.value.tools.note.adding, '1'))

            active = {
                type: 'add',
                lane,
            }
        }

        return true
    },

    dragUpdate(x, y) {
        if (!active) return

        setViewHover(y)

        const lane = xToValidLane(x)

        switch (active.type) {
            case 'add': {
                const beat = yToValidBeat(y)

                view.entities = {
                    hovered: [],
                    creating: [
                        toNoteEntity(createSlideId(), {
                            group: view.group ?? 0,
                            beat,
                            ...getPropertiesFromSelection(),
                            left: Math.min(active.lane, lane),
                            size: Math.abs(active.lane - lane) + 1,
                        }),
                    ],
                }
                focusViewAtBeat(beat)
                break
            }
            case 'edit': {
                view.entities = {
                    hovered: [],
                    creating: [
                        toNoteEntity(
                            active.entity.slideId,
                            {
                                ...active.entity,
                                left: Math.min(active.lane, lane),
                                size: Math.abs(active.lane - lane) + 1,
                            },
                            active.entity,
                        ),
                    ],
                }
                break
            }
            case 'move': {
                const beat = snapYToBeat(y, active.entity.beat)

                view.entities = {
                    hovered: [],
                    creating: [
                        toNoteEntity(
                            active.entity.slideId,
                            {
                                ...active.entity,
                                beat,
                                left: active.entity.left + lane - active.lane,
                            },
                            active.entity,
                        ),
                    ],
                }
                focusViewAtBeat(beat)
                break
            }
        }
    },

    dragEnd(x, y) {
        if (!active) return

        const lane = xToValidLane(x)

        switch (active.type) {
            case 'add': {
                const beat = yToValidBeat(y)

                add({
                    group: view.group ?? 0,
                    beat,
                    ...getPropertiesFromSelection(),
                    left: Math.min(active.lane, lane),
                    size: Math.abs(active.lane - lane) + 1,
                })
                focusViewAtBeat(beat)
                break
            }
            case 'edit': {
                edit(active.entity, {
                    ...active.entity,
                    left: Math.min(active.lane, lane),
                    size: Math.abs(active.lane - lane) + 1,
                })
                break
            }
            case 'move': {
                const beat = snapYToBeat(y, active.entity.beat)

                move(active.entity, {
                    ...active.entity,
                    beat,
                    left: active.entity.left + lane - active.lane,
                })
                focusViewAtBeat(beat)
                break
            }
        }

        active = undefined
    },
}

export const editNote = (entity: NoteEntity, object: Partial<NoteObject>) => {
    edit(entity, {
        group: object.group ?? entity.group,
        beat: object.beat ?? entity.beat,
        noteType: object.noteType ?? entity.noteType,
        isAttached: object.isAttached ?? entity.isAttached,
        left: object.left ?? entity.left,
        size: object.size ?? entity.size,
        isCritical: object.isCritical ?? entity.isCritical,
        flickDirection: object.flickDirection ?? entity.flickDirection,
        isFake: object.isFake ?? entity.isFake,
        sfx: object.sfx ?? entity.sfx,
        isConnectorSeparator: object.isConnectorSeparator ?? entity.isConnectorSeparator,
        connectorType: object.connectorType ?? entity.connectorType,
        connectorEase: object.connectorEase ?? entity.connectorEase,
        connectorActiveIsCritical:
            object.connectorActiveIsCritical ??
            object.isCritical ??
            entity.connectorActiveIsCritical,
        connectorActiveIsFake:
            object.connectorActiveIsFake ?? object.isFake ?? entity.connectorActiveIsFake,
        connectorGuideColor: object.connectorGuideColor ?? entity.connectorGuideColor,
        connectorGuideAlpha: object.connectorGuideAlpha ?? entity.connectorGuideAlpha,
        connectorLayer: object.connectorLayer ?? entity.connectorLayer,
    })
}

export const editSelectedNote = (
    transaction: Transaction,
    entity: NoteEntity,
    object: Partial<NoteObject>,
) => {
    return replaceNote(transaction, entity, {
        group: object.group ?? entity.group,
        beat: object.beat ?? entity.beat,
        noteType: object.noteType ?? entity.noteType,
        isAttached: object.isAttached ?? entity.isAttached,
        left: object.left ?? entity.left,
        size: object.size ?? entity.size,
        isCritical: object.isCritical ?? entity.isCritical,
        flickDirection: object.flickDirection ?? entity.flickDirection,
        isFake: object.isFake ?? entity.isFake,
        sfx: object.sfx ?? entity.sfx,
        isConnectorSeparator: object.isConnectorSeparator ?? entity.isConnectorSeparator,
        connectorType: object.connectorType ?? entity.connectorType,
        connectorEase: object.connectorEase ?? entity.connectorEase,
        connectorActiveIsCritical:
            object.connectorActiveIsCritical ??
            object.isCritical ??
            entity.connectorActiveIsCritical,
        connectorActiveIsFake:
            object.connectorActiveIsFake ?? object.isFake ?? entity.connectorActiveIsFake,
        connectorGuideColor: object.connectorGuideColor ?? entity.connectorGuideColor,
        connectorGuideAlpha: object.connectorGuideAlpha ?? entity.connectorGuideAlpha,
        connectorLayer: object.connectorLayer ?? entity.connectorLayer,
    })
}

const getNoteFromSelection = () => {
    if (selectedEntities.value.length !== 1) return

    const [entity] = selectedEntities.value
    if (entity?.type !== 'note') return

    return entity
}

const getPropertiesFromSelection = () => {
    const note = getNoteFromSelection()

    return {
        noteType: defaultNoteProperties.value.noteType ?? note?.noteType ?? 'default',
        isAttached: defaultNoteProperties.value.isAttached ?? note?.isAttached ?? false,
        size: defaultNoteProperties.value.size ?? note?.size ?? 3,
        isCritical: defaultNoteProperties.value.isCritical ?? note?.isCritical ?? false,
        flickDirection:
            defaultNoteProperties.value.flickDirection ?? note?.flickDirection ?? 'none',
        isFake: defaultNoteProperties.value.isFake ?? note?.isFake ?? false,
        sfx: defaultNoteProperties.value.sfx ?? note?.sfx ?? 'default',
        isConnectorSeparator: defaultNoteProperties.value.isConnectorSeparator ?? false,
        connectorType: defaultNoteProperties.value.connectorType ?? 'active',
        connectorEase: defaultNoteProperties.value.connectorEase ?? 'linear',
        connectorActiveIsCritical:
            defaultNoteProperties.value.connectorActiveIsCritical ??
            defaultNoteProperties.value.isCritical ??
            false,
        connectorActiveIsFake:
            defaultNoteProperties.value.connectorActiveIsFake ??
            defaultNoteProperties.value.isFake ??
            false,
        connectorGuideColor: defaultNoteProperties.value.connectorGuideColor ?? 'green',
        connectorGuideAlpha: defaultNoteProperties.value.connectorGuideAlpha ?? 1,
        connectorLayer: defaultNoteProperties.value.connectorLayer ?? 'top',
    }
}

const tryFind = (x: number, y: number): [NoteEntity] | [undefined, number, number] => {
    const [hit] = hitEntitiesAtPoint('note', x, y)
        .filter((entity) => view.group === undefined || entity.group === view.group)
        .sort((a, b) => +selectedEntities.value.includes(b) - +selectedEntities.value.includes(a))

    return hit ? [hit] : [undefined, yToValidBeat(y), xToValidLane(x)]
}

const update = (message: () => string, action: (transaction: Transaction) => Entity[]) => {
    const transaction = createTransaction(state.value)

    const selectedEntities = action(transaction)

    pushState(
        interpolate(message, `${selectedEntities.length}`),
        transaction.commit(selectedEntities),
    )
    view.entities = {
        hovered: [],
        creating: [],
    }

    notify(interpolate(message, `${selectedEntities.length}`))
}

const add = (object: NoteObject) => {
    update(
        () => i18n.value.tools.note.added,
        (transaction) => addNote(transaction, createSlideId(), object),
    )
}

const edit = (entity: NoteEntity, object: NoteObject) => {
    update(
        () => i18n.value.tools.note.edited,
        (transaction) => replaceNote(transaction, entity, object),
    )
}

const move = (entity: NoteEntity, object: NoteObject) => {
    update(
        () => i18n.value.tools.note.moved,
        (transaction) => replaceNote(transaction, entity, object),
    )
}
