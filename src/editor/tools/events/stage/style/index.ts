import { ref } from 'vue'
import type { Tool } from '../../..'
import type { EventEase } from '../../../../../chart/events'
import type {
    BorderStyle,
    JudgmentLineColor,
    StageStyleEventObject,
} from '../../../../../chart/events/stage/style'
import { pushState, replaceState, state } from '../../../../../history'
import { selectedEntities } from '../../../../../history/selectedEntities'
import { defaultStageId } from '../../../../../history/stages'
import { i18n } from '../../../../../i18n'
import { showModal } from '../../../../../modals'
import type { Entity } from '../../../../../state/entities'
import {
    toStageStyleEventJointEntity,
    type StageStyleEventJointEntity,
} from '../../../../../state/entities/events/joints/stage/style'
import {
    addStageStyleEventJoint,
    removeStageStyleEventJoint,
} from '../../../../../state/mutations/events/stage/style'
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
import StageStyleEventPropertiesModal from './StageStyleEventPropertiesModal.vue'
import StageStyleEventSidebar from './StageStyleEventSidebar.vue'

type DefaultStageStyleEventProperties = {
    judgmentLineColor?: JudgmentLineColor
    leftBorderStyle?: BorderStyle
    rightBorderStyle?: BorderStyle
    stageAlpha?: number
    laneAlpha?: number
    judgmentLineAlpha?: number
    eventEase?: EventEase
    copyProperties: boolean
}

export const defaultStageStyleEventProperties = ref<DefaultStageStyleEventProperties>({
    copyProperties: true,
})

let active:
    | {
          type: 'add'
      }
    | {
          type: 'move'
          entity: StageStyleEventJointEntity
      }
    | undefined

export const stageStyleEvent: Tool = {
    title: () => i18n.value.events.stageStyleEvent,
    sidebar: StageStyleEventSidebar,

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
                    toStageStyleEventJointEntity({
                        stageId: view.stageId ?? defaultStageId.value,
                        beat,
                        editorLane: lane,
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
                const selectedStageStyleEventJointEntities: Entity[] =
                    selectedEntities.value.filter(
                        (entity) => entity.type === 'stageStyleEventJoint',
                    )

                const targets = selectedStageStyleEventJointEntities.includes(entity)
                    ? selectedStageStyleEventJointEntities.filter((e) => e !== entity)
                    : [...selectedStageStyleEventJointEntities, entity]

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
                        () => i18n.value.events.stageStyleEvent,
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
                        void showModal(StageStyleEventPropertiesModal, {})
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
                            () => i18n.value.events.stageStyleEvent,
                        ),
                    )
                }
            }
        } else {
            add({
                stageId: view.stageId ?? defaultStageId.value,
                beat,
                editorLane: lane,
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
                    () => i18n.value.events.stageStyleEvent,
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
                    () => i18n.value.events.stageStyleEvent,
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
                        toStageStyleEventJointEntity({
                            stageId: view.stageId ?? defaultStageId.value,
                            beat,
                            editorLane: lane,
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
                        toStageStyleEventJointEntity({
                            ...active.entity,
                            beat,
                            editorLane: lane,
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
                    editorLane: lane,
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
                    editorLane: lane,
                })
                focusViewAtBeat(beat)
                break
            }
        }

        active = undefined
    },
}

export const editStageStyleEvent = (
    entity: StageStyleEventJointEntity,
    object: Partial<StageStyleEventObject>,
) => {
    edit(entity, {
        stageId: object.stageId ?? entity.stageId,
        beat: object.beat ?? entity.beat,
        editorLane: object.editorLane ?? entity.editorLane,
        judgmentLineColor: object.judgmentLineColor ?? entity.judgmentLineColor,
        leftBorderStyle: object.leftBorderStyle ?? entity.leftBorderStyle,
        rightBorderStyle: object.rightBorderStyle ?? entity.rightBorderStyle,
        stageAlpha: object.stageAlpha ?? entity.stageAlpha,
        laneAlpha: object.laneAlpha ?? entity.laneAlpha,
        judgmentLineAlpha: object.judgmentLineAlpha ?? entity.judgmentLineAlpha,
        eventEase: object.eventEase ?? entity.eventEase,
    })
}

export const editSelectedStageStyleEvent = (
    transaction: Transaction,
    entity: StageStyleEventJointEntity,
    object: Partial<StageStyleEventObject>,
) => {
    removeStageStyleEventJoint(transaction, entity)
    return addStageStyleEventJoint(transaction, {
        stageId: object.stageId ?? entity.stageId,
        beat: object.beat ?? entity.beat,
        editorLane: object.editorLane ?? entity.editorLane,
        judgmentLineColor: object.judgmentLineColor ?? entity.judgmentLineColor,
        leftBorderStyle: object.leftBorderStyle ?? entity.leftBorderStyle,
        rightBorderStyle: object.rightBorderStyle ?? entity.rightBorderStyle,
        stageAlpha: object.stageAlpha ?? entity.stageAlpha,
        laneAlpha: object.laneAlpha ?? entity.laneAlpha,
        judgmentLineAlpha: object.judgmentLineAlpha ?? entity.judgmentLineAlpha,
        eventEase: object.eventEase ?? entity.eventEase,
    })
}

const getStageStyleEventJointFromSelection = () => {
    if (!defaultStageStyleEventProperties.value.copyProperties) return

    if (selectedEntities.value.length !== 1) return

    const [entity] = selectedEntities.value
    if (entity?.type !== 'stageStyleEventJoint') return

    return entity
}

const getPropertiesFromSelection = () => {
    const stageStyleEventJoint = getStageStyleEventJointFromSelection()

    return {
        judgmentLineColor:
            defaultStageStyleEventProperties.value.judgmentLineColor ??
            stageStyleEventJoint?.judgmentLineColor ??
            'purple',
        leftBorderStyle:
            defaultStageStyleEventProperties.value.leftBorderStyle ??
            stageStyleEventJoint?.leftBorderStyle ??
            'default',
        rightBorderStyle:
            defaultStageStyleEventProperties.value.rightBorderStyle ??
            stageStyleEventJoint?.rightBorderStyle ??
            'default',
        stageAlpha:
            defaultStageStyleEventProperties.value.stageAlpha ??
            stageStyleEventJoint?.stageAlpha ??
            1,
        laneAlpha:
            defaultStageStyleEventProperties.value.laneAlpha ??
            stageStyleEventJoint?.laneAlpha ??
            1,
        judgmentLineAlpha:
            defaultStageStyleEventProperties.value.judgmentLineAlpha ??
            stageStyleEventJoint?.judgmentLineAlpha ??
            1,
        eventEase:
            defaultStageStyleEventProperties.value.eventEase ??
            stageStyleEventJoint?.eventEase ??
            'linear',
    }
}

const tryFind = (
    x: number,
    y: number,
): [StageStyleEventJointEntity] | [undefined, number, number] => {
    const [hit] = hitEntitiesAtPoint('stageStyleEventJoint', x, y).sort(
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

const add = (object: StageStyleEventObject) => {
    update(
        interpolate(
            () => i18n.value.tools.events.added,
            '1',
            () => i18n.value.events.stageStyleEvent,
        ),
        (transaction) => addStageStyleEventJoint(transaction, object),
    )
}

const edit = (entity: StageStyleEventJointEntity, object: StageStyleEventObject) => {
    update(
        interpolate(
            () => i18n.value.tools.events.edited,
            '1',
            () => i18n.value.events.stageStyleEvent,
        ),
        (transaction) => {
            removeStageStyleEventJoint(transaction, entity)
            return addStageStyleEventJoint(transaction, object)
        },
    )
}

const move = (entity: StageStyleEventJointEntity, object: StageStyleEventObject) => {
    update(
        interpolate(
            () => i18n.value.tools.events.moved,
            '1',
            () => i18n.value.events.stageStyleEvent,
        ),
        (transaction) => {
            removeStageStyleEventJoint(transaction, entity)
            return addStageStyleEventJoint(transaction, object)
        },
    )
}
