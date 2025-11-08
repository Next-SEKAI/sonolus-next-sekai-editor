import { computed, ref } from 'vue'
import type { Tool } from '..'
import type { NoteObject } from '../../../chart'
import { pushState, replaceState, state } from '../../../history'
import { selectedEntities } from '../../../history/selectedEntities'
import { store } from '../../../history/store'
import { i18n } from '../../../i18n'
import { showModal } from '../../../modals'
import { settings, type DefaultNoteSlideProperties } from '../../../settings'
import type { Entity } from '../../../state/entities'
import { createSlideId, type SlideId } from '../../../state/entities/slides'
import { toNoteEntity, type NoteEntity } from '../../../state/entities/slides/note'
import { addNote, replaceNote } from '../../../state/mutations/slides/note'
import { createTransaction, type Transaction } from '../../../state/transaction'
import { interpolate } from '../../../utils/interpolate'
import { bisect } from '../../../utils/ordered'
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
import SlidePropertiesModal from './SlidePropertiesModal.vue'
import SlideSidebar from './SlideSidebar.vue'

export const defaultSlidePropertiesPresetIndex = ref(0)

export const setDefaultSlidePropertiesPreset = (properties: DefaultNoteSlideProperties) => {
    settings.defaultSlidePropertiesPresets = settings.defaultSlidePropertiesPresets.map(
        (preset, i) => (i === defaultSlidePropertiesPresetIndex.value ? properties : preset),
    )
}

export const defaultSlideProperties = computed(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    () => settings.defaultSlidePropertiesPresets[defaultSlidePropertiesPresetIndex.value]!,
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

export const slide: Tool = {
    sidebar: SlideSidebar,

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
                    toNoteEntity(getSelectedSlideId() ?? createSlideId(), {
                        group: view.group ?? 0,
                        beat,
                        left: lane,
                        ...getPropertiesFromSelection(beat),
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

                notify(interpolate(() => i18n.value.tools.slide.selected, `${targets.length}`))
            } else {
                if (entities.every((entity) => selectedEntities.value.includes(entity))) {
                    focusViewAtBeat(entity.beat)

                    if (isSidebarVisible.value) {
                        quickEdit(defaultSlideProperties.value)
                    } else {
                        void showModal(SlidePropertiesModal, {})
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

                    notify(interpolate(() => i18n.value.tools.slide.selected, `${entities.length}`))
                }
            }
        } else {
            add(getSelectedSlideId() ?? createSlideId(), {
                group: view.group ?? 0,
                beat,
                left: lane,
                ...getPropertiesFromSelection(beat),
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
                notify(interpolate(() => i18n.value.tools.slide.moving, '1'))

                active = {
                    type: 'move',
                    entity,
                    lane: xToValidLane(x),
                }
            } else {
                notify(interpolate(() => i18n.value.tools.slide.editing, '1'))

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

            notify(interpolate(() => i18n.value.tools.slide.adding, '1'))

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
                        toNoteEntity(getSelectedSlideId() ?? createSlideId(), {
                            group: view.group ?? 0,
                            beat,
                            ...getPropertiesFromSelection(beat),
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

                add(getSelectedSlideId() ?? createSlideId(), {
                    group: view.group ?? 0,
                    beat,
                    ...getPropertiesFromSelection(beat),
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

const getNoteFromSelection = () => {
    if (selectedEntities.value.length !== 1) return

    const [entity] = selectedEntities.value
    if (entity?.type !== 'note') return

    return entity
}

const getNearestNoteInSlide = (slideId: SlideId, beat: number) => {
    const notes = store.value.slides.note.get(slideId)
    if (!notes) throw new Error('Unexpected notes not found')

    const index = bisect(notes, 'beat', beat)
    return notes[index - 1] ?? notes[index]
}

const getPropertiesFromSelection = (beat: number) => {
    const note = getNoteFromSelection()
    const nearest = note && getNearestNoteInSlide(note.slideId, beat)

    return {
        noteType: defaultSlideProperties.value.noteType ?? note?.noteType ?? 'default',
        isAttached: defaultSlideProperties.value.isAttached ?? note?.isAttached ?? false,
        size: defaultSlideProperties.value.size ?? note?.size ?? 3,
        isCritical: defaultSlideProperties.value.isCritical ?? note?.isCritical ?? false,
        flickDirection:
            defaultSlideProperties.value.flickDirection ?? note?.flickDirection ?? 'none',
        isFake: defaultSlideProperties.value.isFake ?? note?.isFake ?? false,
        isConnectorSeparator: defaultSlideProperties.value.isConnectorSeparator ?? false,
        connectorType:
            defaultSlideProperties.value.connectorType ?? nearest?.connectorType ?? 'active',
        connectorEase: defaultSlideProperties.value.connectorEase ?? 'linear',
        connectorActiveIsCritical:
            defaultSlideProperties.value.connectorActiveIsCritical ??
            defaultSlideProperties.value.isCritical ??
            nearest?.connectorActiveIsCritical ??
            false,
        connectorActiveIsFake:
            defaultSlideProperties.value.connectorActiveIsFake ??
            defaultSlideProperties.value.isFake ??
            nearest?.connectorActiveIsFake ??
            false,
        connectorGuideColor:
            defaultSlideProperties.value.connectorGuideColor ??
            nearest?.connectorGuideColor ??
            'green',
        connectorGuideAlpha:
            defaultSlideProperties.value.connectorGuideAlpha ?? nearest?.connectorGuideAlpha ?? 1,
    }
}

const tryFind = (x: number, y: number): [NoteEntity] | [undefined, number, number] => {
    const [hit] = hitEntitiesAtPoint('note', x, y)
        .filter((entity) => view.group === undefined || entity.group === view.group)
        .sort((a, b) => +selectedEntities.value.includes(b) - +selectedEntities.value.includes(a))

    return hit ? [hit] : [undefined, yToValidBeat(y), xToValidLane(x)]
}

const getSelectedSlideId = () => {
    if (!selectedEntities.value.every((entity) => entity.type === 'note')) return

    const [entity] = selectedEntities.value
    if (!entity) return

    if (!selectedEntities.value.every(({ slideId }) => slideId === entity.slideId)) return

    return entity.slideId
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

const add = (slideId: SlideId, object: NoteObject) => {
    update(
        () => i18n.value.tools.slide.added,
        (transaction) => addNote(transaction, slideId, object),
    )
}

const edit = (entity: NoteEntity, object: NoteObject) => {
    update(
        () => i18n.value.tools.slide.edited,
        (transaction) => replaceNote(transaction, entity, object),
    )
}

const move = (entity: NoteEntity, object: NoteObject) => {
    update(
        () => i18n.value.tools.slide.moved,
        (transaction) => replaceNote(transaction, entity, object),
    )
}
