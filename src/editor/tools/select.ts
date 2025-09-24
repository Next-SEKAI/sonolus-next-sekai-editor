import { type Tool } from '.'
import type { BpmObject, NoteObject, TimeScaleObject } from '../../chart'
import { pushState, replaceState, state } from '../../history'
import { selectedEntities } from '../../history/selectedEntities'
import { i18n } from '../../i18n'
import type { Entity } from '../../state/entities'
import { toBpmEntity, type BpmEntity } from '../../state/entities/bpm'
import { toNoteEntity, type NoteEntity } from '../../state/entities/slides/note'
import { toTimeScaleEntity, type TimeScaleEntity } from '../../state/entities/timeScale'
import { addBpm, removeBpm } from '../../state/mutations/bpm'
import { replaceNote } from '../../state/mutations/slides/note'
import { addTimeScale, removeTimeScale } from '../../state/mutations/timeScale'
import { getInStoreGrid } from '../../state/store/grid'
import { createTransaction, type Transaction } from '../../state/transaction'
import { interpolate } from '../../utils/interpolate'
import { align } from '../../utils/math'
import { notify } from '../notification'
import {
    focusViewAtBeat,
    laneToValidLane,
    setViewHover,
    view,
    xToLane,
    yToBeatOffset,
    yToTime,
    yToValidBeat,
} from '../view'
import {
    hitAllEntitiesAtPoint,
    hitAllEntitiesInSelection,
    modifyEntities,
    toSelection,
} from './utils'

let active:
    | {
          type: 'move'
          lane: number
          focus: Entity
          entities: Entity[]
      }
    | {
          type: 'select'
          lane: number
          time: number
          count: number
          entities: Entity[]
      }
    | undefined

export const select: Tool = {
    hover(x, y, modifiers) {
        const entities = modifyEntities(hitAllEntitiesAtPoint(x, y), modifiers)

        view.entities = {
            hovered: entities,
            creating: [],
        }
    },

    tap(x, y, modifiers) {
        if (modifiers.ctrl) {
            const entities = modifyEntities(hitAllEntitiesAtPoint(x, y), modifiers)

            const [entity] = entities
            if (!entity) return

            const targets = entities.every((entity) => selectedEntities.value.includes(entity))
                ? selectedEntities.value.filter((entity) => !entities.includes(entity))
                : [...new Set([...selectedEntities.value, ...entities])]

            replaceState({
                ...state.value,
                selectedEntities: targets,
            })
            view.entities = {
                hovered: entities,
                creating: [],
            }
            focusViewAtBeat(entity.beat)

            notify(interpolate(() => i18n.value.tools.select.selected, `${targets.length}`))
        } else {
            const entities = hitAllEntitiesAtPoint(x, y)

            const selectedLength = selectedEntities.value.length
            const current = selectedLength ? selectedEntities.value[0] : undefined

            const index = current ? (entities.indexOf(current) + 1) % entities.length : 0
            const entity = entities[index]
            const targets = modifyEntities(entity ? [entity] : [], modifiers)

            replaceState({
                ...state.value,
                selectedEntities: targets,
            })
            view.entities = {
                hovered: entities,
                creating: [],
            }

            if (entity) {
                focusViewAtBeat(entity.beat)

                notify(interpolate(() => i18n.value.tools.select.selected, `${targets.length}`))
            } else {
                focusViewAtBeat(yToValidBeat(y))

                if (selectedLength) notify(() => i18n.value.tools.select.deselected)
            }
        }
    },

    dragStart(x, y) {
        const lane = xToLane(x)
        const time = yToTime(y)

        const entities = hitAllEntitiesAtPoint(x, y)

        const [focus] = entities.filter((entity) => selectedEntities.value.includes(entity))
        if (focus) {
            focusViewAtBeat(focus.beat)

            notify(
                interpolate(
                    () => i18n.value.tools.select.moving,
                    `${selectedEntities.value.length}`,
                ),
            )

            active = {
                type: 'move',
                lane,
                focus,
                entities: selectedEntities.value,
            }
        } else {
            const [entity] = entities
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

                notify(interpolate(() => i18n.value.tools.select.moving, '1'))

                active = {
                    type: 'move',
                    lane,
                    focus: entity,
                    entities: [entity],
                }
            } else {
                active = {
                    type: 'select',
                    lane,
                    time,
                    count: -1,
                    entities: selectedEntities.value,
                }
            }
        }

        return true
    },

    dragUpdate(x, y, modifiers) {
        if (!active) return

        setViewHover(y)

        switch (active.type) {
            case 'move': {
                const lane = xToLane(x)
                const beatOffset = yToBeatOffset(y, active.focus.beat)

                const creating: Entity[] = []
                for (const entity of active.entities) {
                    const beat = entity.beat + beatOffset
                    if (beat < 0) continue

                    const result = creates[entity.type]?.(
                        active.entities,
                        entity as never,
                        active.lane,
                        lane,
                        beat,
                        active.focus,
                    )
                    if (!result) continue

                    creating.push(result)
                }

                view.entities = {
                    hovered: [],
                    creating,
                }
                focusViewAtBeat(active.focus.beat + beatOffset)
                break
            }
            case 'select': {
                const selection = toSelection(active.lane, active.time, x, y)
                const entities = modifyEntities(hitAllEntitiesInSelection(selection), modifiers)
                const targets = modifiers.ctrl
                    ? [...new Set([...active.entities, ...entities])]
                    : entities

                replaceState({
                    ...state.value,
                    selectedEntities: targets,
                })
                view.selection = selection
                view.entities = {
                    hovered: [],
                    creating: [],
                }

                if (active.count === targets.length) return
                active.count = targets.length

                notify(interpolate(() => i18n.value.tools.select.selecting, `${targets.length}`))
                break
            }
        }
    },

    dragEnd(x, y, modifiers) {
        if (!active) return

        switch (active.type) {
            case 'move': {
                const transaction = createTransaction(state.value)

                const lane = xToLane(x)
                const beatOffset = yToBeatOffset(y, active.focus.beat)

                const entities = active.entities.sort(
                    beatOffset > 0 ? (a, b) => b.beat - a.beat : (a, b) => a.beat - b.beat,
                )

                const selectedEntities: Entity[] = []
                for (const entity of entities) {
                    const beat = entity.beat + beatOffset
                    if (beat < 0) continue

                    const result = moves[entity.type]?.(
                        transaction,
                        entities,
                        entity as never,
                        active.lane,
                        lane,
                        beat,
                        active.focus,
                    )
                    if (!result) continue

                    selectedEntities.push(...result)
                }

                pushState(
                    interpolate(() => i18n.value.tools.select.moved, `${selectedEntities.length}`),
                    transaction.commit(selectedEntities),
                )
                view.entities = {
                    hovered: [],
                    creating: [],
                }
                focusViewAtBeat(active.focus.beat + beatOffset)

                notify(
                    interpolate(() => i18n.value.tools.select.moved, `${selectedEntities.length}`),
                )
                break
            }
            case 'select': {
                const selection = toSelection(active.lane, active.time, x, y)
                const entities = modifyEntities(hitAllEntitiesInSelection(selection), modifiers)
                const targets = modifiers.ctrl
                    ? [...new Set([...active.entities, ...entities])]
                    : entities

                replaceState({
                    ...state.value,
                    selectedEntities: targets,
                })
                view.selection = undefined
                view.entities = {
                    hovered: [],
                    creating: [],
                }

                notify(interpolate(() => i18n.value.tools.select.selected, `${targets.length}`))
                break
            }
        }

        active = undefined
    },
}

const toMovedBpmObject = (entity: BpmEntity, beat: number): BpmObject => ({
    beat,
    bpm: entity.bpm,
})

const toMovedTimeScaleObject = (entity: TimeScaleEntity, beat: number): TimeScaleObject => ({
    group: entity.group,
    beat,
    timeScale: entity.timeScale,
    skip: entity.skip,
    ease: entity.ease,
    hideNotes: entity.hideNotes,
})

const toMovedNoteObject = (
    entities: Entity[],
    entity: NoteEntity,
    startLane: number,
    lane: number,
    beat: number,
    focus: Entity,
): NoteObject => {
    if (focus.type === 'note' && entities.every((entity) => entity.type === 'note')) {
        if (startLane <= focus.left + 0.5) {
            const a = entity.left + entity.size - 1
            const b = entity.left + (laneToValidLane(lane) - laneToValidLane(startLane))

            return {
                ...entity,
                left: Math.min(a, b),
                size: Math.abs(a - b) + 1,
            }
        } else if (startLane >= focus.left + focus.size - 0.5) {
            const a = entity.left
            const b =
                entity.left + entity.size - 1 + (laneToValidLane(lane) - laneToValidLane(startLane))

            return {
                ...entity,
                left: Math.min(a, b),
                size: Math.abs(a - b) + 1,
            }
        }
    }

    return {
        ...entity,
        beat,
        left: entity.left + align(lane) - align(startLane),
    }
}

type Create<T extends Entity> = (
    entities: Entity[],
    entity: T,
    startLane: number,
    lane: number,
    beat: number,
    focus: Entity,
) => Entity | undefined

const creates: {
    [T in Entity as T['type']]?: Create<T>
} = {
    bpm: (entities, entity, startLane, lane, beat) => toBpmEntity(toMovedBpmObject(entity, beat)),
    timeScale: (entities, entity, startLane, lane, beat) =>
        toTimeScaleEntity(toMovedTimeScaleObject(entity, beat)),

    note: (entities, entity, startLane, lane, beat, focus) =>
        toNoteEntity(
            entity.slideId,
            toMovedNoteObject(entities, entity, startLane, lane, beat, focus),
            entity,
        ),
}

type Move<T extends Entity> = (
    transaction: Transaction,
    entities: Entity[],
    entity: T,
    startLane: number,
    lane: number,
    beat: number,
    focus: Entity,
) => Entity[] | undefined

const moves: {
    [T in Entity as T['type']]?: Move<T>
} = {
    bpm: (transaction, entities, entity, startLane, lane, beat) => {
        const object = toMovedBpmObject(entity, beat)

        if (entity.beat) removeBpm(transaction, entity)

        const overlap = getInStoreGrid(transaction.store.grid, 'bpm', object.beat)?.find(
            (entity) => entity.beat === object.beat,
        )
        if (overlap) removeBpm(transaction, overlap)

        return addBpm(transaction, object)
    },
    timeScale: (transaction, entities, entity, startLane, lane, beat) => {
        const object = toMovedTimeScaleObject(entity, beat)

        removeTimeScale(transaction, entity)

        const overlap = getInStoreGrid(transaction.store.grid, 'timeScale', object.beat)?.find(
            (entity) => entity.beat === object.beat && entity.group === object.group,
        )
        if (overlap) removeTimeScale(transaction, overlap)

        return addTimeScale(transaction, object)
    },

    note: (transaction, entities, entity, startLane, lane, beat, focus) => {
        const object = toMovedNoteObject(entities, entity, startLane, lane, beat, focus)

        return replaceNote(transaction, entity, object)
    },
}
