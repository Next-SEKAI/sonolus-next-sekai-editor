import type { Tool } from '..'
import type {
    ConnectorEase,
    ConnectorGuideColor,
    ConnectorType,
    FlickDirection,
    NoteSfx,
    NoteType,
    TimeScaleEase,
} from '../../../chart'
import { pushState, replaceState, state } from '../../../history'
import { selectedEntities } from '../../../history/selectedEntities'
import { i18n } from '../../../i18n'
import type { Entity } from '../../../state/entities'
import { createTransaction, type Transaction } from '../../../state/transaction'
import { interpolate } from '../../../utils/interpolate'
import { notify } from '../../notification'
import { focusViewAtBeat, setViewHover, view, xToLane, yToTime, yToValidBeat } from '../../view'
import { editSelectedNote } from '../note'
import { editSelectedTimeScale } from '../timeScale'
import {
    hitAllEntitiesAtPoint,
    hitAllEntitiesInSelection,
    modifyEntities,
    toSelection,
} from '../utils'
import BrushSidebar from './BrushSidebar.vue'

export type BrushProperties = {
    group?: number
    noteType?: NoteType
    isAttached?: boolean
    size?: number
    isCritical?: boolean
    flickDirection?: FlickDirection
    isFake?: boolean
    sfx?: NoteSfx
    isConnectorSeparator?: boolean
    connectorType?: ConnectorType
    connectorEase?: ConnectorEase
    connectorActiveIsCritical?: boolean
    connectorActiveIsFake?: boolean
    connectorGuideColor?: ConnectorGuideColor
    connectorGuideAlpha?: number
    timeScale?: number
    skip?: number
    ease?: TimeScaleEase
    hideNotes?: boolean
}

export let brushProperties: BrushProperties = {}

export const setBrushProperties = (properties: BrushProperties) => {
    brushProperties = properties
}

let active:
    | {
          lane: number
          time: number
          count: number
      }
    | undefined

export const brush: Tool = {
    sidebar: BrushSidebar,

    hover(x, y, modifiers) {
        const entities = modifyEntities(hitAllEntitiesAtPoint(x, y), modifiers)

        view.entities = {
            hovered: entities,
            creating: [],
        }
    },

    tap(x, y, modifiers) {
        const entities = hitAllEntitiesAtPoint(x, y)

        if (entities.some((entity) => selectedEntities.value.includes(entity))) {
            apply(modifyEntities(selectedEntities.value, modifiers))
            focusViewAtBeat(yToValidBeat(y))
        } else {
            const [entity] = entities
            if (entity) {
                apply(modifyEntities(entities, modifiers))
                focusViewAtBeat(entity.beat)
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
                if (selectedLength) notify(() => i18n.value.tools.brush.deselected)
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

    dragUpdate(x, y, modifiers) {
        if (!active) return

        setViewHover(y)

        const selection = toSelection(active.lane, active.time, x, y)
        const targets = modifyEntities(hitAllEntitiesInSelection(selection), modifiers)

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

        notify(interpolate(() => i18n.value.tools.brush.brushing, `${targets.length}`))
    },

    dragEnd(x, y, modifiers) {
        if (!active) return

        const selection = toSelection(active.lane, active.time, x, y)

        view.selection = undefined

        apply(modifyEntities(hitAllEntitiesInSelection(selection), modifiers))

        active = undefined
    },
}

type Apply<T> = (transaction: Transaction, entity: T, object: BrushProperties) => Entity[]

const applies: {
    [T in Entity as T['type']]?: Apply<T>
} = {
    timeScale: editSelectedTimeScale,
    note: editSelectedNote,
}

const apply = (entities: Entity[]) => {
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

    const selectedEntities = entities.flatMap(
        (entity) =>
            applies[entity.type]?.(transaction, entity as never, brushProperties) ?? [entity],
    )

    pushState(
        interpolate(() => i18n.value.tools.brush.brushed, `${entities.length}`),
        transaction.commit(selectedEntities),
    )
    view.entities = {
        hovered: [],
        creating: [],
    }

    notify(interpolate(() => i18n.value.tools.brush.brushed, `${entities.length}`))
}
