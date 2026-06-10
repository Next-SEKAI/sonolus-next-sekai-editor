import { ref } from 'vue'
import type { Tool } from '../../..'
import type { EventEase } from '../../../../../chart/events'
import type { DivisionParity, StagePivotEventObject } from '../../../../../chart/events/stage/pivot'
import { pushState, replaceState, state } from '../../../../../history'
import { selectedEntities } from '../../../../../history/selectedEntities'
import { defaultStageId } from '../../../../../history/stages'
import { i18n } from '../../../../../i18n'
import { showModal } from '../../../../../modals'
import type { Entity } from '../../../../../state/entities'
import {
    toStagePivotEventJointEntity,
    type StagePivotEventJointEntity,
} from '../../../../../state/entities/events/joints/stage/pivot'
import {
    addStagePivotEventJoint,
    removeStagePivotEventJoint,
} from '../../../../../state/mutations/events/stage/pivot'
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
import StagePivotEventPropertiesModal from './StagePivotEventPropertiesModal.vue'
import StagePivotEventSidebar from './StagePivotEventSidebar.vue'

type DefaultStagePivotEventProperties = {
    divisionSize?: number
    divisionParity?: DivisionParity
    yOffset?: number
    yOffsetBeat?: number
    eventEase?: EventEase
    copyProperties: boolean
}

export const defaultStagePivotEventProperties = ref<DefaultStagePivotEventProperties>({
    copyProperties: true,
})

let active:
    | {
          type: 'add'
      }
    | {
          type: 'move'
          entity: StagePivotEventJointEntity
      }
    | undefined

export const stagePivotEvent: Tool = {
    title: () => i18n.value.events.stagePivotEvent,
    sidebar: StagePivotEventSidebar,

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
                    toStagePivotEventJointEntity({
                        stageId: view.stageId ?? defaultStageId.value,
                        beat,
                        pivotLane: lane,
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
                const selectedStagePivotEventJointEntities: Entity[] =
                    selectedEntities.value.filter(
                        (entity) => entity.type === 'stagePivotEventJoint',
                    )

                const targets = selectedStagePivotEventJointEntities.includes(entity)
                    ? selectedStagePivotEventJointEntities.filter((e) => e !== entity)
                    : [...selectedStagePivotEventJointEntities, entity]

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
                        () => i18n.value.events.stagePivotEvent,
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
                        void showModal(StagePivotEventPropertiesModal, {})
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
                            () => i18n.value.events.stagePivotEvent,
                        ),
                    )
                }
            }
        } else {
            add({
                stageId: view.stageId ?? defaultStageId.value,
                beat,
                pivotLane: lane,
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
                    () => i18n.value.events.stagePivotEvent,
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
                    () => i18n.value.events.stagePivotEvent,
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
                        toStagePivotEventJointEntity({
                            stageId: view.stageId ?? defaultStageId.value,
                            beat,
                            pivotLane: lane,
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
                        toStagePivotEventJointEntity({
                            ...active.entity,
                            beat,
                            pivotLane: lane,
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
                    pivotLane: lane,
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
                    pivotLane: lane,
                })
                focusViewAtBeat(beat)
                break
            }
        }

        active = undefined
    },
}

export const editStagePivotEvent = (
    entity: StagePivotEventJointEntity,
    object: Partial<StagePivotEventObject>,
) => {
    edit(entity, {
        stageId: object.stageId ?? entity.stageId,
        beat: object.beat ?? entity.beat,
        pivotLane: object.pivotLane ?? entity.pivotLane,
        divisionSize: object.divisionSize ?? entity.divisionSize,
        divisionParity: object.divisionParity ?? entity.divisionParity,
        yOffset: object.yOffset ?? entity.yOffset,
        yOffsetBeat: object.yOffsetBeat ?? entity.yOffsetBeat,
        eventEase: object.eventEase ?? entity.eventEase,
    })
}

export const editSelectedStagePivotEvent = (
    transaction: Transaction,
    entity: StagePivotEventJointEntity,
    object: Partial<StagePivotEventObject>,
) => {
    removeStagePivotEventJoint(transaction, entity)
    return addStagePivotEventJoint(transaction, {
        stageId: object.stageId ?? entity.stageId,
        beat: object.beat ?? entity.beat,
        pivotLane: object.pivotLane ?? entity.pivotLane,
        divisionSize: object.divisionSize ?? entity.divisionSize,
        divisionParity: object.divisionParity ?? entity.divisionParity,
        yOffset: object.yOffset ?? entity.yOffset,
        yOffsetBeat: object.yOffsetBeat ?? entity.yOffsetBeat,
        eventEase: object.eventEase ?? entity.eventEase,
    })
}

const getStagePivotEventJointFromSelection = () => {
    if (!defaultStagePivotEventProperties.value.copyProperties) return

    if (selectedEntities.value.length !== 1) return

    const [entity] = selectedEntities.value
    if (entity?.type !== 'stagePivotEventJoint') return

    return entity
}

const getPropertiesFromSelection = () => {
    const stagePivotEventJoint = getStagePivotEventJointFromSelection()

    return {
        divisionSize:
            defaultStagePivotEventProperties.value.divisionSize ??
            stagePivotEventJoint?.divisionSize ??
            2,
        divisionParity:
            defaultStagePivotEventProperties.value.divisionParity ??
            stagePivotEventJoint?.divisionParity ??
            'even',
        yOffset:
            defaultStagePivotEventProperties.value.yOffset ?? stagePivotEventJoint?.yOffset ?? 0,
        yOffsetBeat:
            defaultStagePivotEventProperties.value.yOffsetBeat ??
            stagePivotEventJoint?.yOffsetBeat ??
            0,
        eventEase:
            defaultStagePivotEventProperties.value.eventEase ??
            stagePivotEventJoint?.eventEase ??
            'linear',
    }
}

const tryFind = (
    x: number,
    y: number,
): [StagePivotEventJointEntity] | [undefined, number, number] => {
    const [hit] = hitEntitiesAtPoint('stagePivotEventJoint', x, y).sort(
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

const add = (object: StagePivotEventObject) => {
    update(
        interpolate(
            () => i18n.value.tools.events.added,
            '1',
            () => i18n.value.events.stagePivotEvent,
        ),
        (transaction) => addStagePivotEventJoint(transaction, object),
    )
}

const edit = (entity: StagePivotEventJointEntity, object: StagePivotEventObject) => {
    update(
        interpolate(
            () => i18n.value.tools.events.edited,
            '1',
            () => i18n.value.events.stagePivotEvent,
        ),
        (transaction) => {
            removeStagePivotEventJoint(transaction, entity)
            return addStagePivotEventJoint(transaction, object)
        },
    )
}

const move = (entity: StagePivotEventJointEntity, object: StagePivotEventObject) => {
    update(
        interpolate(
            () => i18n.value.tools.events.moved,
            '1',
            () => i18n.value.events.stagePivotEvent,
        ),
        (transaction) => {
            removeStagePivotEventJoint(transaction, entity)
            return addStagePivotEventJoint(transaction, object)
        },
    )
}
