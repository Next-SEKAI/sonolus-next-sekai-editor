import type { BpmObject, NoteObject, TimeScaleObject } from '../../../chart'
import { pushState, state } from '../../../history'
import { selectedEntities } from '../../../history/selectedEntities'
import { i18n } from '../../../i18n'
import type { Entity } from '../../../state/entities'
import type { BpmEntity } from '../../../state/entities/bpm'
import type { NoteEntity } from '../../../state/entities/slides/note'
import type { TimeScaleEntity } from '../../../state/entities/timeScale'
import { createTransaction, type Transaction } from '../../../state/transaction'
import { interpolate } from '../../../utils/interpolate'
import { notify } from '../../notification'
import { editBpm, editSelectedBpm } from '../../tools/bpm'
import { editNote, editSelectedNote } from '../../tools/note'
import { editSelectedTimeScale, editTimeScale } from '../../tools/timeScale'
import { view } from '../../view'

export type EditableObject = Partial<BpmObject & TimeScaleObject & NoteObject>

export type EditableEntity = BpmEntity | TimeScaleEntity | NoteEntity

export const isEditableEntity = (entity: Entity) =>
    entity.type === 'bpm' || entity.type === 'timeScale' || entity.type === 'note'

export const editSelectedEditableEntities = (object: EditableObject) => {
    if (selectedEntities.value.length === 1) {
        const editEntity = getEditEntity()

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const entity = selectedEntities.value[0]!
        editEntity[entity.type]?.(entity as never, object)
    } else {
        const editSelectedEntity = getEditSelectedEntity()

        const transaction = createTransaction(state.value)

        const entities = selectedEntities.value.flatMap(
            (entity) =>
                editSelectedEntity[entity.type]?.(transaction, entity as never, object) ?? [entity],
        )

        pushState(
            interpolate(
                () => i18n.value.sidebars.default.edited,
                `${selectedEntities.value.length}`,
            ),
            transaction.commit(entities),
        )
        view.entities = {
            hovered: [],
            creating: [],
        }

        notify(
            interpolate(
                () => i18n.value.sidebars.default.edited,
                `${selectedEntities.value.length}`,
            ),
        )
    }
}

let editEntity:
    | {
          [T in Entity as T['type']]?: (entity: T, object: EditableObject) => void
      }
    | undefined

const getEditEntity = () =>
    (editEntity ??= {
        bpm: editBpm,
        timeScale: editTimeScale,

        note: editNote,
    })

let editSelectedEntity:
    | {
          [T in Entity as T['type']]?: (
              transaction: Transaction,
              entity: T,
              object: EditableObject,
          ) => Entity[]
      }
    | undefined

const getEditSelectedEntity = () =>
    (editSelectedEntity ??= {
        bpm: editSelectedBpm,
        timeScale: editSelectedTimeScale,

        note: editSelectedNote,
    })
