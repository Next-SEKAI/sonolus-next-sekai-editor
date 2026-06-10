import { ref } from 'vue'
import type { Tool } from '../../..'
import type { EventEase } from '../../../../../chart/events'
import type { StageMaskEventObject } from '../../../../../chart/events/stage/mask'
import { pushState, replaceState, state } from '../../../../../history'
import { selectedEntities } from '../../../../../history/selectedEntities'
import { defaultStageId } from '../../../../../history/stages'
import { i18n } from '../../../../../i18n'
import { showModal } from '../../../../../modals'
import type { Entity } from '../../../../../state/entities'
import {
    toStageMaskEventJointEntity,
    type StageMaskEventJointEntity,
} from '../../../../../state/entities/events/joints/stage/mask'
import {
    addStageMaskEventJoint,
    removeStageMaskEventJoint,
} from '../../../../../state/mutations/events/stage/mask'
import { createTransaction, type Transaction } from '../../../../../state/transaction'
import { interpolate } from '../../../../../utils/interpolate'
import { notify } from '../../../../notification'
import { isSidebarVisible } from '../../../../sidebars'
import {
    focusViewAtBeat,
    setViewHover,
    snapYToBeat,
    view,
    xToLane,
    xToValidLane,
    yToValidBeat,
} from '../../../../view'
import { hitEntitiesAtPoint, offset, resize } from '../../../utils'
import StageMaskEventPropertiesModal from './StageMaskEventPropertiesModal.vue'
import StageMaskEventSidebar from './StageMaskEventSidebar.vue'

type DefaultStageMaskEventProperties = {
    maskSize?: number
    eventEase?: EventEase
    copyProperties: boolean
}

export const defaultStageMaskEventProperties = ref<DefaultStageMaskEventProperties>({
    copyProperties: true,
})

let active:
    | {
          type: 'add'
          lane: number
      }
    | {
          type: 'edit'
          entity: StageMaskEventJointEntity
          lane: number
      }
    | {
          type: 'move'
          entity: StageMaskEventJointEntity
          lane: number
      }
    | undefined

export const stageMaskEvent: Tool = {
    title: () => i18n.value.events.stageMaskEvent,
    sidebar: StageMaskEventSidebar,

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
                    toStageMaskEventJointEntity({
                        stageId: view.stageId ?? defaultStageId.value,
                        beat,
                        maskLeft: lane,
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
                const selectedStageMaskEventJointEntities: Entity[] = selectedEntities.value.filter(
                    (entity) => entity.type === 'stageMaskEventJoint',
                )

                const targets = selectedStageMaskEventJointEntities.includes(entity)
                    ? selectedStageMaskEventJointEntities.filter((e) => e !== entity)
                    : [...selectedStageMaskEventJointEntities, entity]

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
                        () => i18n.value.events.stageMaskEvent,
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
                        void showModal(StageMaskEventPropertiesModal, {})
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
                            () => i18n.value.events.stageMaskEvent,
                        ),
                    )
                }
            }
        } else {
            add({
                stageId: view.stageId ?? defaultStageId.value,
                beat,
                maskLeft: lane,
                ...getPropertiesFromSelection(),
            })
            focusViewAtBeat(beat)
        }
    },

    dragStart(x, y) {
        const [entity, beat, lane] = tryFind(x, y)
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

            const lane = xToLane(x)
            if (lane > entity.maskLeft + 0.5 && lane < entity.maskLeft + entity.maskSize - 0.5) {
                notify(
                    interpolate(
                        () => i18n.value.tools.events.moving,
                        '1',
                        () => i18n.value.events.stageMaskEvent,
                    ),
                )

                active = {
                    type: 'move',
                    entity,
                    lane,
                }
            } else {
                notify(
                    interpolate(
                        () => i18n.value.tools.events.editing,
                        '1',
                        () => i18n.value.events.stageMaskEvent,
                    ),
                )

                active = {
                    type: 'edit',
                    entity,
                    lane:
                        entity.maskLeft +
                        (lane >= entity.maskLeft + entity.maskSize / 2 ? 0 : entity.maskSize),
                }
            }
        } else {
            focusViewAtBeat(beat)

            notify(
                interpolate(
                    () => i18n.value.tools.events.adding,
                    '1',
                    () => i18n.value.events.stageMaskEvent,
                ),
            )

            active = {
                type: 'add',
                lane,
            }
        }

        return true
    },

    dragUpdate(x, y) {
        if (!active) return

        setViewHover(y)

        const lane = xToLane(x)

        switch (active.type) {
            case 'add': {
                const beat = yToValidBeat(y)
                const [maskLeft, maskSize] = resize(active.lane, lane)

                view.entities = {
                    hovered: [],
                    creating: [
                        toStageMaskEventJointEntity({
                            stageId: view.stageId ?? defaultStageId.value,
                            beat,
                            ...getPropertiesFromSelection(),
                            maskLeft,
                            maskSize,
                        }),
                    ],
                }
                focusViewAtBeat(beat)
                break
            }
            case 'edit': {
                const [maskLeft, maskSize] = resize(active.lane, lane)

                view.entities = {
                    hovered: [],
                    creating: [
                        toStageMaskEventJointEntity({
                            ...active.entity,
                            maskLeft,
                            maskSize,
                        }),
                    ],
                }
                break
            }
            case 'move': {
                const beat = snapYToBeat(y, active.entity.beat)

                view.entities = {
                    hovered: [],
                    creating: [
                        toStageMaskEventJointEntity({
                            ...active.entity,
                            beat,
                            maskLeft: active.entity.maskLeft + offset(active.lane, lane),
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

        const lane = xToLane(x)

        switch (active.type) {
            case 'add': {
                const beat = yToValidBeat(y)
                const [maskLeft, maskSize] = resize(active.lane, lane)

                add({
                    stageId: view.stageId ?? defaultStageId.value,
                    beat,
                    ...getPropertiesFromSelection(),
                    maskLeft,
                    maskSize,
                })
                focusViewAtBeat(beat)
                break
            }
            case 'edit': {
                const [maskLeft, maskSize] = resize(active.lane, lane)

                edit(active.entity, {
                    ...active.entity,
                    maskLeft,
                    maskSize,
                })
                break
            }
            case 'move': {
                const beat = snapYToBeat(y, active.entity.beat)

                move(active.entity, {
                    ...active.entity,
                    beat,
                    maskLeft: active.entity.maskLeft + offset(active.lane, lane),
                })
                focusViewAtBeat(beat)
                break
            }
        }

        active = undefined
    },
}

export const editStageMaskEvent = (
    entity: StageMaskEventJointEntity,
    object: Partial<StageMaskEventObject>,
) => {
    edit(entity, {
        stageId: object.stageId ?? entity.stageId,
        beat: object.beat ?? entity.beat,
        maskLeft: object.maskLeft ?? entity.maskLeft,
        maskSize: object.maskSize ?? entity.maskSize,
        eventEase: object.eventEase ?? entity.eventEase,
    })
}

export const editSelectedStageMaskEvent = (
    transaction: Transaction,
    entity: StageMaskEventJointEntity,
    object: Partial<StageMaskEventObject>,
) => {
    removeStageMaskEventJoint(transaction, entity)
    return addStageMaskEventJoint(transaction, {
        stageId: object.stageId ?? entity.stageId,
        beat: object.beat ?? entity.beat,
        maskLeft: object.maskLeft ?? entity.maskLeft,
        maskSize: object.maskSize ?? entity.maskSize,
        eventEase: object.eventEase ?? entity.eventEase,
    })
}

const getStageMaskEventJointFromSelection = () => {
    if (!defaultStageMaskEventProperties.value.copyProperties) return

    if (selectedEntities.value.length !== 1) return

    const [entity] = selectedEntities.value
    if (entity?.type !== 'stageMaskEventJoint') return

    return entity
}

const getPropertiesFromSelection = () => {
    const stageMaskEventJoint = getStageMaskEventJointFromSelection()

    return {
        maskSize:
            defaultStageMaskEventProperties.value.maskSize ?? stageMaskEventJoint?.maskSize ?? 12,
        eventEase:
            defaultStageMaskEventProperties.value.eventEase ??
            stageMaskEventJoint?.eventEase ??
            'linear',
    }
}

const tryFind = (
    x: number,
    y: number,
): [StageMaskEventJointEntity] | [undefined, number, number] => {
    const [hit] = hitEntitiesAtPoint('stageMaskEventJoint', x, y).sort(
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

const add = (object: StageMaskEventObject) => {
    update(
        interpolate(
            () => i18n.value.tools.events.added,
            '1',
            () => i18n.value.events.stageMaskEvent,
        ),
        (transaction) => addStageMaskEventJoint(transaction, object),
    )
}

const edit = (entity: StageMaskEventJointEntity, object: StageMaskEventObject) => {
    update(
        interpolate(
            () => i18n.value.tools.events.edited,
            '1',
            () => i18n.value.events.stageMaskEvent,
        ),
        (transaction) => {
            removeStageMaskEventJoint(transaction, entity)
            return addStageMaskEventJoint(transaction, object)
        },
    )
}

const move = (entity: StageMaskEventJointEntity, object: StageMaskEventObject) => {
    update(
        interpolate(
            () => i18n.value.tools.events.moved,
            '1',
            () => i18n.value.events.stageMaskEvent,
        ),
        (transaction) => {
            removeStageMaskEventJoint(transaction, entity)
            return addStageMaskEventJoint(transaction, object)
        },
    )
}
