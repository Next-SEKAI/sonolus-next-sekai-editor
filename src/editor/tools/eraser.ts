import type { Tool } from '.'
import { pushState, replaceState, state } from '../../history'
import { selectedEntities } from '../../history/selectedEntities'
import { i18n } from '../../i18n'
import type { Entity } from '../../state/entities'
import { removeBpm } from '../../state/mutations/bpm'
import { removeNote } from '../../state/mutations/slides/note'
import { removeTimeScale } from '../../state/mutations/timeScale'
import { createTransaction, type Transaction } from '../../state/transaction'
import { interpolate } from '../../utils/interpolate'
import { notify } from '../notification'
import { focusViewAtBeat, setViewHover, view, xToLane, yToTime, yToValidBeat } from '../view'
import { hitAllEntitiesAtPoint, hitAllEntitiesInSelection, toSelection } from './utils'

let active:
    | {
          lane: number
          time: number
          count: number
      }
    | undefined

export const eraser: Tool = {
    hover(x, y) {
        const entities = hitAllEntitiesAtPoint(x, y)

        view.entities = {
            hovered: entities.some((entity) => selectedEntities.value.includes(entity))
                ? []
                : entities.filter(canRemove).slice(0, 1),
            creating: [],
        }
    },

    tap(x, y) {
        const entities = hitAllEntitiesAtPoint(x, y)

        if (entities.some((entity) => selectedEntities.value.includes(entity))) {
            focusViewAtBeat(yToValidBeat(y))
            remove(selectedEntities.value)
        } else {
            const [entity] = entities.filter(canRemove)
            if (entity) {
                focusViewAtBeat(entity.beat)
                remove([entity])
            } else {
                const selectedLength = selectedEntities.value.length

                replaceState({
                    ...state.value,
                    selectedEntities: [],
                })
                view.entities = {
                    hovered: [],
                    creating: [],
                }

                focusViewAtBeat(yToValidBeat(y))
                if (selectedLength) notify(() => i18n.value.tools.eraser.deselected)
            }
        }
    },

    dragStart(x, y) {
        active = {
            lane: xToLane(x),
            time: yToTime(y),
            count: -1,
        }

        return true
    },

    dragUpdate(x, y) {
        if (!active) return

        setViewHover(y)

        const selection = toSelection(active.lane, active.time, x, y)
        const selectedEntities = hitAllEntitiesInSelection(selection).filter(canRemove)

        replaceState({
            ...state.value,
            selectedEntities,
        })
        view.selection = selection
        view.entities = {
            hovered: [],
            creating: [],
        }

        if (active.count === selectedEntities.length) return
        active.count = selectedEntities.length

        notify(interpolate(() => i18n.value.tools.eraser.erasing, `${selectedEntities.length}`))
    },

    dragEnd(x, y) {
        if (!active) return

        const selection = toSelection(active.lane, active.time, x, y)

        view.selection = undefined

        remove(hitAllEntitiesInSelection(selection))

        active = undefined
    },
}

const canRemoves: {
    [T in Entity as T['type']]?: (entity: T) => boolean
} = {
    bpm: (entity) => entity.beat > 0,
}

const removes: {
    [T in Entity as T['type']]?: (transaction: Transaction, entity: T) => void
} = {
    bpm: removeBpm,
    timeScale: removeTimeScale,

    note: removeNote,
}

const canRemove = (entity: Entity) => canRemoves[entity.type]?.(entity as never) ?? true

const remove = (entities: Entity[]) => {
    entities = entities.filter(canRemove)
    if (!entities.length) {
        replaceState({
            ...state.value,
            selectedEntities: [],
        })
        view.entities = {
            hovered: [],
            creating: [],
        }
        return
    }

    const transaction = createTransaction(state.value)

    for (const entity of entities) {
        removes[entity.type]?.(transaction, entity as never)
    }

    pushState(
        interpolate(() => i18n.value.tools.eraser.erased, `${entities.length}`),
        transaction.commit([]),
    )
    view.entities = {
        hovered: [],
        creating: [],
    }

    notify(interpolate(() => i18n.value.tools.eraser.erased, `${entities.length}`))
}
