import type { Command } from '..'
import type { FlickDirection } from '../../../chart/note'
import { pushState, state } from '../../../history'
import { selectedEntities } from '../../../history/selectedEntities'
import { i18n } from '../../../i18n'
import type { Entity } from '../../../state/entities'
import { createTransaction, type Transaction } from '../../../state/transaction'
import { interpolate } from '../../../utils/interpolate'
import { notify } from '../../notification'
import { editSelectedCameraEvent } from '../../tools/events/camera'
import { editSelectedStageMaskEvent } from '../../tools/events/stage/mask'
import { editSelectedStagePivotEvent } from '../../tools/events/stage/pivot'
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
    [T in Entity as T['type']]: Flip<T> | undefined
} = {
    bpm: undefined,
    timeScale: undefined,

    cameraEventJoint: (transaction, entity) =>
        editSelectedCameraEvent(transaction, entity, {
            cameraLeft: -(entity.cameraLeft + entity.cameraSize),
            cameraZoomTargetLane: -entity.cameraZoomTargetLane,
            cameraRotation: -entity.cameraRotation,
        }),
    cameraEventConnection: undefined,

    stageMaskEventJoint: (transaction, entity) =>
        editSelectedStageMaskEvent(transaction, entity, {
            maskLeft: -(entity.maskLeft + entity.maskSize),
        }),
    stageMaskEventConnection: undefined,

    stagePivotEventJoint: (transaction, entity) =>
        editSelectedStagePivotEvent(transaction, entity, {
            pivotLane: -entity.pivotLane,
        }),
    stagePivotEventConnection: undefined,

    note: (transaction, entity) =>
        editSelectedNote(transaction, entity, {
            left: -(entity.left + entity.size),
            flickDirection: flippedFlickDirections[entity.flickDirection],
        }),
    connector: undefined,
}
