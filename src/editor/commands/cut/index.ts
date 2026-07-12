import type { Command } from '..'
import { setClipboardData } from '../../../clipboard/index.ts'
import { pushState, replaceState, state } from '../../../history'
import { isDynamicStages } from '../../../history/dynamicStages.ts'
import { groups } from '../../../history/groups'
import { initialLife } from '../../../history/initialLife'
import { selectedEntities } from '../../../history/selectedEntities'
import { stages } from '../../../history/stages'
import { store } from '../../../history/store'
import { i18n } from '../../../i18n'
import { serializeToLevelDataEntities } from '../../../levelData/entities/serialize'
import type { Entity, EntityOfType, EntityType } from '../../../state/entities'
import type { RemoveMutation } from '../../../state/mutations'
import { removeBpm } from '../../../state/mutations/bpm'
import { removeCameraEventJoint } from '../../../state/mutations/events/camera'
import { removeStageMaskEventJoint } from '../../../state/mutations/events/stage/mask'
import { removeStagePivotEventJoint } from '../../../state/mutations/events/stage/pivot'
import { removeStageStyleEventJoint } from '../../../state/mutations/events/stage/style'
import { removeStageTransformEventJoint } from '../../../state/mutations/events/stage/transform.ts'
import { removeNote } from '../../../state/mutations/slides/note'
import { removeTimeScale } from '../../../state/mutations/timeScale'
import { createStore } from '../../../state/store/creates'
import { createTransaction } from '../../../state/transaction'
import { interpolate } from '../../../utils/interpolate'
import { notify } from '../../notification'
import { view, xToLane, yToValidBeat } from '../../view'
import CutIcon from './CutIcon.vue'

export const cut: Command = {
    title: () => i18n.value.commands.cut.title,
    icon: {
        is: CutIcon,
    },

    execute() {
        const entities = selectedEntities.value

        if (!entities.length) {
            notify(() => i18n.value.commands.cut.noSelected)
            return
        }

        setClipboardData({
            lane: xToLane(view.pointer.x),
            beat: yToValidBeat(view.pointer.y),
            entities: serializeToLevelDataEntities(
                initialLife.value,
                isDynamicStages.value,
                createStore({
                    initialLife: initialLife.value,
                    isDynamicStages: isDynamicStages.value,
                    bpms: getEntities(entities, 'bpm'),
                    timeScales: getEntities(entities, 'timeScale'),
                    cameraEvents: getEntities(entities, 'cameraEventJoint'),
                    stageMaskEvents: getEntities(entities, 'stageMaskEventJoint'),
                    stagePivotEvents: getEntities(entities, 'stagePivotEventJoint'),
                    stageStyleEvents: getEntities(entities, 'stageStyleEventJoint'),
                    stageTransformEvents: getEntities(entities, 'stageTransformEventJoint'),
                    groups: groups.value,
                    stages: stages.value,
                    slides: getSlides(entities),
                }),
                groups.value,
                stages.value,
            ),
        })

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
    [T in Entity as T['type']]: ((entity: T) => boolean) | undefined
} = {
    bpm: (entity) => entity.beat > 0,
    timeScale: undefined,

    cameraEventJoint: undefined,
    cameraEventConnection: undefined,

    stageMaskEventJoint: undefined,
    stageMaskEventConnection: undefined,

    stagePivotEventJoint: undefined,
    stagePivotEventConnection: undefined,

    stageStyleEventJoint: undefined,
    stageStyleEventConnection: undefined,

    stageTransformEventJoint: undefined,
    stageTransformEventConnection: undefined,

    note: undefined,
    connector: undefined,
}

const removes: {
    [T in Entity as T['type']]: RemoveMutation<T> | undefined
} = {
    bpm: removeBpm,
    timeScale: removeTimeScale,

    cameraEventJoint: removeCameraEventJoint,
    cameraEventConnection: undefined,

    stageMaskEventJoint: removeStageMaskEventJoint,
    stageMaskEventConnection: undefined,

    stagePivotEventJoint: removeStagePivotEventJoint,
    stagePivotEventConnection: undefined,

    stageStyleEventJoint: removeStageStyleEventJoint,
    stageStyleEventConnection: undefined,

    stageTransformEventJoint: removeStageTransformEventJoint,
    stageTransformEventConnection: undefined,

    note: removeNote,
    connector: undefined,
}
