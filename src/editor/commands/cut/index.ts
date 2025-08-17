import type { Command } from '..'
import type { ClipboardData } from '../../../clipboardData/schema'
import { pushState, replaceState, state } from '../../../history'
import { selectedEntities } from '../../../history/selectedEntities'
import { store } from '../../../history/store'
import { i18n } from '../../../i18n'
import { serializeToLevelDataEntities } from '../../../levelData/entities/serialize'
import type { Entity, EntityOfType, EntityType } from '../../../state/entities'
import { removeBpm } from '../../../state/mutations/bpm'
import { removeNote } from '../../../state/mutations/slides/note'
import { removeTimeScale } from '../../../state/mutations/timeScale'
import { createStore } from '../../../state/store/creates'
import { createTransaction, type Transaction } from '../../../state/transaction'
import { interpolate } from '../../../utils/interpolate'
import { notify } from '../../notification'
import { view, xToLane, yToValidBeat } from '../../view'
import CutIcon from './CutIcon.vue'

export const cut: Command = {
    title: () => i18n.value.commands.cut.title,
    icon: {
        is: CutIcon,
    },

    async execute() {
        const entities = selectedEntities.value

        if (!entities.length) {
            notify(() => i18n.value.commands.cut.noSelected)
            return
        }

        const data: ClipboardData = {
            lane: xToLane(view.pointer.x),
            beat: yToValidBeat(view.pointer.y),
            entities: serializeToLevelDataEntities(
                createStore({
                    bpms: getEntities(entities, 'bpm'),
                    timeScales: getEntities(entities, 'timeScale'),
                    groupCount: state.value.groupCount,
                    slides: getSlides(entities),
                }),
                state.value.groupCount,
            ),
        }
        const text = JSON.stringify(data)

        await navigator.clipboard.writeText(text)

        const removeEntities = entities.filter(
            (entity) => canRemoves[entity.type]?.(entity as never) ?? true,
        )
        if (!removeEntities.length) {
            replaceState({
                ...state.value,
                selectedEntities: [],
            })
            view.entities = {
                hovered: [],
                creating: [],
            }
        } else {
            const transaction = createTransaction(state.value)

            for (const entity of removeEntities) {
                removes[entity.type]?.(transaction, entity as never)
            }

            pushState(
                interpolate(() => i18n.value.commands.cut.cut, `${entities.length}`),
                transaction.commit([]),
            )
            view.entities = {
                hovered: [],
                creating: [],
            }
        }

        notify(interpolate(() => i18n.value.commands.cut.cut, `${entities.length}`))
    },
}

const getEntities = <T extends EntityType>(entities: Entity[], type: T) =>
    entities.filter((entity): entity is EntityOfType<T> => entity.type === type)

const getSlides = (entities: Entity[]) => {
    const selectedNotes = entities.filter((entity) => entity.type === 'note')
    const selectedNotesSet = new Set(selectedNotes)

    return [...new Set(selectedNotes.map((note) => note.slideId))].map((slideId) => {
        const notes = store.value.slides.note.get(slideId)
        if (!notes) throw new Error('Unexpected notes not found')

        return notes.filter((note) => selectedNotesSet.has(note))
    })
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
