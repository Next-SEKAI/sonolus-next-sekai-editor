import { ref } from 'vue'
import type { Tool } from '../../..'
import type { EventEase } from '../../../../../chart/events'
import type { Anchor, StageTransformEventObject } from '../../../../../chart/events/stage/transform'
import { pushState, replaceState, state } from '../../../../../history'
import { selectedEntities } from '../../../../../history/selectedEntities'
import { defaultStageId } from '../../../../../history/stages'
import { i18n } from '../../../../../i18n'
import { showModal } from '../../../../../modals'
import type { Entity } from '../../../../../state/entities'
import {
    toStageTransformEventJointEntity,
    type StageTransformEventJointEntity,
} from '../../../../../state/entities/events/joints/stage/transform'
import {
    addStageTransformEventJoint,
    removeStageTransformEventJoint,
} from '../../../../../state/mutations/events/stage/transform'
import { createTransaction, type Transaction } from '../../../../../state/transaction'
import { interpolate } from '../../../../../utils/interpolate'
import { notify } from '../../../../notification'
import { isSidebarVisible } from '../../../../sidebars'
import {
    focusViewAtBeat,
    setViewHover,
    snapYToBeat,
    view,
    xToValidLane,
    yToValidBeat,
} from '../../../../view'
import { hitEntitiesAtPoint } from '../../../utils'
import StageTransformEventPropertiesModal from './StageTransformEventPropertiesModal.vue'
import StageTransformEventSidebar from './StageTransformEventSidebar.vue'

type DefaultStageTransformEventProperties = {
    rotation?: number
    yTranslation?: number
    anchor?: Anchor
    eventEase?: EventEase
    copyProperties: boolean
}

export const defaultStageTransformEventProperties = ref<DefaultStageTransformEventProperties>({
    copyProperties: true,
})

let active:
    | {
          type: 'add'
      }
    | {
          type: 'move'
          entity: StageTransformEventJointEntity
      }
    | undefined

export const stageTransformEvent: Tool = {
    title: () => i18n.value.events.stageTransformEvent,
    sidebar: StageTransformEventSidebar,

    hover(x, y) {
        const [entity, beat, lane] = tryFind(x, y)
        if (entity) {
            view.entities = {
                hovered: [entity],
                creating: [],
            }
        } else {
            view.entities = {
                hovered: [],
                creating: [
                    toStageTransformEventJointEntity({
                        stageId: view.stageId ?? defaultStageId.value,
                        beat,
                        xTranslation: lane,
                        ...getPropertiesFromSelection(),
                    }),
                ],
            }
        }
    },

    tap(x, y, modifiers) {
        const [entity, beat, lane] = tryFind(x, y)
        if (entity) {
            if (modifiers.ctrl) {
                const selectedStageTransformEventJointEntities: Entity[] =
                    selectedEntities.value.filter(
                        (entity) => entity.type === 'stageTransformEventJoint',
                    )

                const targets = selectedStageTransformEventJointEntities.includes(entity)
                    ? selectedStageTransformEventJointEntities.filter((e) => e !== entity)
                    : [...selectedStageTransformEventJointEntities, entity]

                replaceState({
                    ...state.value,
                    selectedEntities: targets,
                })
                view.entities = {
                    hovered: [],
                    creating: [],
                }
                focusViewAtBeat(entity.beat)

                notify(
                    interpolate(
                        () => i18n.value.tools.events.selected,
                        `${targets.length}`,
                        () => i18n.value.events.stageTransformEvent,
                    ),
                )
            } else {
                if (selectedEntities.value.includes(entity)) {
                    focusViewAtBeat(entity.beat)

                    if (isSidebarVisible.value) {
                        edit(entity, {
                            ...entity,
                            eventEase: (
                                {
                                    linear: 'in',
                                    in: 'out',
                                    out: 'inOut',
                                    inOut: 'outIn',
                                    outIn: 'none',
                                    none: 'linear',
                                } as const
                            )[entity.eventEase],
                        })
                    } else {
                        void showModal(StageTransformEventPropertiesModal, {})
                    }
                } else {
                    replaceState({
                        ...state.value,
                        selectedEntities: [entity],
                    })
                    view.entities = {
                        hovered: [],
                        creating: [],
                    }
                    focusViewAtBeat(entity.beat)

                    notify(
                        interpolate(
                            () => i18n.value.tools.events.selected,
                            '1',
                            () => i18n.value.events.stageTransformEvent,
                        ),
                    )
                }
            }
        } else {
            add({
                stageId: view.stageId ?? defaultStageId.value,
                beat,
                xTranslation: lane,
                ...getPropertiesFromSelection(),
            })
            focusViewAtBeat(beat)
        }
    },

    dragStart(x, y) {
        const [entity, beat] = tryFind(x, y)
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

            notify(
                interpolate(
                    () => i18n.value.tools.events.moving,
                    '1',
                    () => i18n.value.events.stageTransformEvent,
                ),
            )

            active = {
                type: 'move',
                entity,
            }
        } else {
            focusViewAtBeat(beat)

            notify(
                interpolate(
                    () => i18n.value.tools.events.adding,
                    '1',
                    () => i18n.value.events.stageTransformEvent,
                ),
            )

            active = {
                type: 'add',
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
                        toStageTransformEventJointEntity({
                            stageId: view.stageId ?? defaultStageId.value,
                            beat,
                            xTranslation: lane,
                            ...getPropertiesFromSelection(),
                        }),
                    ],
                }
                focusViewAtBeat(beat)
                break
            }
            case 'move': {
                const beat = snapYToBeat(y, active.entity.beat)

                view.entities = {
                    hovered: [],
                    creating: [
                        toStageTransformEventJointEntity({
                            ...active.entity,
                            beat,
                            xTranslation: lane,
                        }),
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

                add({
                    stageId: view.stageId ?? defaultStageId.value,
                    beat,
                    xTranslation: lane,
                    ...getPropertiesFromSelection(),
                })
                focusViewAtBeat(beat)
                break
            }
            case 'move': {
                const beat = snapYToBeat(y, active.entity.beat)

                move(active.entity, {
                    ...active.entity,
                    beat,
                    xTranslation: lane,
                })
                focusViewAtBeat(beat)
                break
            }
        }

        active = undefined
    },
}

export const editStageTransformEvent = (
    entity: StageTransformEventJointEntity,
    object: Partial<StageTransformEventObject>,
) => {
    edit(entity, {
        stageId: object.stageId ?? entity.stageId,
        beat: object.beat ?? entity.beat,
        rotation: object.rotation ?? entity.rotation,
        xTranslation: object.xTranslation ?? entity.xTranslation,
        yTranslation: object.yTranslation ?? entity.yTranslation,
        anchor: object.anchor ?? entity.anchor,
        eventEase: object.eventEase ?? entity.eventEase,
    })
}

export const editSelectedStageTransformEvent = (
    transaction: Transaction,
    entity: StageTransformEventJointEntity,
    object: Partial<StageTransformEventObject>,
) => {
    removeStageTransformEventJoint(transaction, entity)
    return addStageTransformEventJoint(transaction, {
        stageId: object.stageId ?? entity.stageId,
        beat: object.beat ?? entity.beat,
        rotation: object.rotation ?? entity.rotation,
        xTranslation: object.xTranslation ?? entity.xTranslation,
        yTranslation: object.yTranslation ?? entity.yTranslation,
        anchor: object.anchor ?? entity.anchor,
        eventEase: object.eventEase ?? entity.eventEase,
    })
}

const getStageTransformEventJointFromSelection = () => {
    if (!defaultStageTransformEventProperties.value.copyProperties) return

    if (selectedEntities.value.length !== 1) return

    const [entity] = selectedEntities.value
    if (entity?.type !== 'stageTransformEventJoint') return

    return entity
}

const getPropertiesFromSelection = () => {
    const stageTransformEventJoint = getStageTransformEventJointFromSelection()

    return {
        rotation:
            defaultStageTransformEventProperties.value.rotation ??
            stageTransformEventJoint?.rotation ??
            0,
        yTranslation:
            defaultStageTransformEventProperties.value.yTranslation ??
            stageTransformEventJoint?.yTranslation ??
            0,
        anchor:
            defaultStageTransformEventProperties.value.anchor ??
            stageTransformEventJoint?.anchor ??
            'default',
        eventEase:
            defaultStageTransformEventProperties.value.eventEase ??
            stageTransformEventJoint?.eventEase ??
            'linear',
    }
}

const tryFind = (
    x: number,
    y: number,
): [StageTransformEventJointEntity] | [undefined, number, number] => {
    const [hit] = hitEntitiesAtPoint('stageTransformEventJoint', x, y).sort(
        (a, b) => +selectedEntities.value.includes(b) - +selectedEntities.value.includes(a),
    )

    return hit ? [hit] : [undefined, yToValidBeat(y), xToValidLane(x)]
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

const add = (object: StageTransformEventObject) => {
    update(
        interpolate(
            () => i18n.value.tools.events.added,
            '1',
            () => i18n.value.events.stageTransformEvent,
        ),
        (transaction) => addStageTransformEventJoint(transaction, object),
    )
}

const edit = (entity: StageTransformEventJointEntity, object: StageTransformEventObject) => {
    update(
        interpolate(
            () => i18n.value.tools.events.edited,
            '1',
            () => i18n.value.events.stageTransformEvent,
        ),
        (transaction) => {
            removeStageTransformEventJoint(transaction, entity)
            return addStageTransformEventJoint(transaction, object)
        },
    )
}

const move = (entity: StageTransformEventJointEntity, object: StageTransformEventObject) => {
    update(
        interpolate(
            () => i18n.value.tools.events.moved,
            '1',
            () => i18n.value.events.stageTransformEvent,
        ),
        (transaction) => {
            removeStageTransformEventJoint(transaction, entity)
            return addStageTransformEventJoint(transaction, object)
        },
    )
}
