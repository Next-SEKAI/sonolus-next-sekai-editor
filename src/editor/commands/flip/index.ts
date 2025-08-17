import type { Command } from '..'
import type { FlickDirection } from '../../../chart'
import { pushState, state } from '../../../history'
import { selectedEntities } from '../../../history/selectedEntities'
import { i18n } from '../../../i18n'
import type { Entity } from '../../../state/entities'
import { createTransaction, type Transaction } from '../../../state/transaction'
import { interpolate } from '../../../utils/interpolate'
import { notify } from '../../notification'
import { editSelectedNote } from '../../tools/note'
import { view } from '../../view'
import FlipIcon from './FlipIcon.vue'

export const flip: Command = {
    title: () => i18n.value.commands.flip.title,
    icon: {
        is: FlipIcon,
    },

    execute() {
        const entities = selectedEntities.value

        if (!entities.length) {
            notify(() => i18n.value.commands.flip.noSelected)
            return
        }

        const transaction = createTransaction(state.value)

        const flippedEntities = entities.flatMap(
            (entity) => flips[entity.type]?.(transaction, entity as never) ?? [entity],
        )

        pushState(
            interpolate(() => i18n.value.commands.flip.flipped, `${entities.length}`),
            transaction.commit(flippedEntities),
        )
        view.entities = {
            hovered: [],
            creating: [],
        }

        notify(interpolate(() => i18n.value.commands.flip.flipped, `${entities.length}`))
    },
}

type Flip<T> = (transaction: Transaction, entity: T) => Entity[]

const flippedFlickDirections: Record<FlickDirection, FlickDirection> = {
    none: 'none',
    up: 'up',
    upLeft: 'upRight',
    upRight: 'upLeft',
    down: 'down',
    downLeft: 'downRight',
    downRight: 'downLeft',
}

const flips: {
    [T in Entity as T['type']]?: Flip<T>
} = {
    note: (transaction, entity) =>
        editSelectedNote(transaction, entity, {
            ...entity,
            left: -(entity.left + entity.size),
            flickDirection: flippedFlickDirections[entity.flickDirection],
        }),
}
