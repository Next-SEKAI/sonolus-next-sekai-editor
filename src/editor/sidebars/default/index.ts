import type { BpmObject } from '../../../chart/bpm'
import type { CameraEventObject } from '../../../chart/events/camera'
import type { StageMaskEventObject } from '../../../chart/events/stage/mask'
import type { StagePivotEventObject } from '../../../chart/events/stage/pivot'
import type { NoteObject } from '../../../chart/note'
import type { TimeScaleObject } from '../../../chart/timeScale'
import { pushState, state } from '../../../history'
import { selectedEntities } from '../../../history/selectedEntities'
import { i18n } from '../../../i18n'
import type { Entity } from '../../../state/entities'
import type { BpmEntity } from '../../../state/entities/bpm'
import type { CameraEventJointEntity } from '../../../state/entities/events/joints/camera'
import type { StageMaskEventJointEntity } from '../../../state/entities/events/joints/stage/mask'
import type { StagePivotEventJointEntity } from '../../../state/entities/events/joints/stage/pivot'
import type { NoteEntity } from '../../../state/entities/slides/note'
import type { TimeScaleEntity } from '../../../state/entities/timeScale'
import { createTransaction, type Transaction } from '../../../state/transaction'
import { interpolate } from '../../../utils/interpolate'
import { notify } from '../../notification'
import { editBpm, editSelectedBpm } from '../../tools/bpm'
import { editCameraEvent, editSelectedCameraEvent } from '../../tools/events/camera'
import { editSelectedStageMaskEvent, editStageMaskEvent } from '../../tools/events/stage/mask'
import { editSelectedStagePivotEvent, editStagePivotEvent } from '../../tools/events/stage/pivot'
import { editNote, editSelectedNote } from '../../tools/note'
import { editSelectedTimeScale, editTimeScale } from '../../tools/timeScale'
import { view } from '../../view'

export type EditableObject = Partial<
    BpmObject &
        TimeScaleObject &
        CameraEventObject &
        StageMaskEventObject &
        StagePivotEventObject &
        NoteObject
>

export type EditableEntity =
    | BpmEntity
    | TimeScaleEntity
    | CameraEventJointEntity
    | StageMaskEventJointEntity
    | StagePivotEventJointEntity
    | NoteEntity

export const isEditableEntity = (entity: Entity) =>
    entity.type === 'bpm' ||
    entity.type === 'timeScale' ||
    entity.type === 'cameraEventJoint' ||
    entity.type === 'stageMaskEventJoint' ||
    entity.type === 'stagePivotEventJoint' ||
    entity.type === 'note'

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
          [T in Entity as T['type']]: ((entity: T, object: EditableObject) => void) | undefined
      }
    | undefined

const getEditEntity = () =>
    (editEntity ??= {
        bpm: editBpm,
        timeScale: editTimeScale,

        cameraEventJoint: editCameraEvent,
        cameraEventConnection: undefined,

        stageMaskEventJoint: editStageMaskEvent,
        stageMaskEventConnection: undefined,

        stagePivotEventJoint: editStagePivotEvent,
        stagePivotEventConnection: undefined,

        note: editNote,
        connector: undefined,
    })

let editSelectedEntity:
    | {
          [T in Entity as T['type']]:
              | ((transaction: Transaction, entity: T, object: EditableObject) => Entity[])
              | undefined
      }
    | undefined

const getEditSelectedEntity = () =>
    (editSelectedEntity ??= {
        bpm: editSelectedBpm,
        timeScale: editSelectedTimeScale,

        cameraEventJoint: editSelectedCameraEvent,
        cameraEventConnection: undefined,

        stageMaskEventJoint: editSelectedStageMaskEvent,
        stageMaskEventConnection: undefined,

        stagePivotEventJoint: editSelectedStagePivotEvent,
        stagePivotEventConnection: undefined,

        note: editSelectedNote,
        connector: undefined,
    })
