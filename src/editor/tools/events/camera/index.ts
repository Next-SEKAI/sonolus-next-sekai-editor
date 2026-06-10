import { ref } from 'vue'
import type { Tool } from '../..'
import type { EventEase } from '../../../../chart/events'
import type { CameraEventObject, CameraZoomVerticalAlign } from '../../../../chart/events/camera'
import { pushState, replaceState, state } from '../../../../history'
import { selectedEntities } from '../../../../history/selectedEntities'
import { i18n } from '../../../../i18n'
import { showModal } from '../../../../modals'
import type { Entity } from '../../../../state/entities'
import {
    toCameraEventJointEntity,
    type CameraEventJointEntity,
} from '../../../../state/entities/events/joints/camera'
import {
    addCameraEventJoint,
    removeCameraEventJoint,
} from '../../../../state/mutations/events/camera'
import { createTransaction, type Transaction } from '../../../../state/transaction'
import { interpolate } from '../../../../utils/interpolate'
import { notify } from '../../../notification'
import { isSidebarVisible } from '../../../sidebars'
import {
    focusViewAtBeat,
    setViewHover,
    snapYToBeat,
    view,
    xToLane,
    xToValidLane,
    yToValidBeat,
} from '../../../view'
import { hitEntitiesAtPoint, offset, resize } from '../../utils'
import CameraEventPropertiesModal from './CameraEventPropertiesModal.vue'
import CameraEventSidebar from './CameraEventSidebar.vue'

type DefaultCameraEventProperties = {
    cameraSize?: number
    cameraZoom?: number
    cameraZoomTargetLane?: number
    cameraZoomTargetY?: number
    cameraZoomVerticalAlign?: CameraZoomVerticalAlign
    cameraRotation?: number
    cameraStageTilt?: number
    eventEase?: EventEase
    copyProperties: boolean
}

export const defaultCameraEventProperties = ref<DefaultCameraEventProperties>({
    copyProperties: true,
})

let active:
    | {
          type: 'add'
          lane: number
      }
    | {
          type: 'edit'
          entity: CameraEventJointEntity
          lane: number
      }
    | {
          type: 'move'
          entity: CameraEventJointEntity
          lane: number
      }
    | undefined

export const cameraEvent: Tool = {
    title: () => i18n.value.events.cameraEvent,
    sidebar: CameraEventSidebar,

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
                    toCameraEventJointEntity({
                        beat,
                        cameraLeft: lane,
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
                const selectedCameraEventJointEntities: Entity[] = selectedEntities.value.filter(
                    (entity) => entity.type === 'cameraEventJoint',
                )

                const targets = selectedCameraEventJointEntities.includes(entity)
                    ? selectedCameraEventJointEntities.filter((e) => e !== entity)
                    : [...selectedCameraEventJointEntities, entity]

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
                        () => i18n.value.events.cameraEvent,
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
                        void showModal(CameraEventPropertiesModal, {})
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
                            () => i18n.value.events.cameraEvent,
                        ),
                    )
                }
            }
        } else {
            add({
                beat,
                cameraLeft: lane,
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
            if (
                lane > entity.cameraLeft + 0.5 &&
                lane < entity.cameraLeft + entity.cameraSize - 0.5
            ) {
                notify(
                    interpolate(
                        () => i18n.value.tools.events.moving,
                        '1',
                        () => i18n.value.events.cameraEvent,
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
                        () => i18n.value.events.cameraEvent,
                    ),
                )

                active = {
                    type: 'edit',
                    entity,
                    lane:
                        entity.cameraLeft +
                        (lane >= entity.cameraLeft + entity.cameraSize / 2 ? 0 : entity.cameraSize),
                }
            }
        } else {
            focusViewAtBeat(beat)

            notify(
                interpolate(
                    () => i18n.value.tools.events.adding,
                    '1',
                    () => i18n.value.events.cameraEvent,
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
                const [cameraLeft, cameraSize] = resize(active.lane, lane, 6, 24)

                view.entities = {
                    hovered: [],
                    creating: [
                        toCameraEventJointEntity({
                            beat,
                            ...getPropertiesFromSelection(),
                            cameraLeft,
                            cameraSize,
                        }),
                    ],
                }
                focusViewAtBeat(beat)
                break
            }
            case 'edit': {
                const [cameraLeft, cameraSize] = resize(active.lane, lane, 6, 24)

                view.entities = {
                    hovered: [],
                    creating: [
                        toCameraEventJointEntity({
                            ...active.entity,
                            cameraLeft,
                            cameraSize,
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
                        toCameraEventJointEntity({
                            ...active.entity,
                            beat,
                            cameraLeft: active.entity.cameraLeft + offset(active.lane, lane),
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
                const [cameraLeft, cameraSize] = resize(active.lane, lane, 6, 24)

                add({
                    beat,
                    ...getPropertiesFromSelection(),
                    cameraLeft,
                    cameraSize,
                })
                focusViewAtBeat(beat)
                break
            }
            case 'edit': {
                const [cameraLeft, cameraSize] = resize(active.lane, lane, 6, 24)

                edit(active.entity, {
                    ...active.entity,
                    cameraLeft,
                    cameraSize,
                })
                break
            }
            case 'move': {
                const beat = snapYToBeat(y, active.entity.beat)

                move(active.entity, {
                    ...active.entity,
                    beat,
                    cameraLeft: active.entity.cameraLeft + offset(active.lane, lane),
                })
                focusViewAtBeat(beat)
                break
            }
        }

        active = undefined
    },
}

export const editCameraEvent = (
    entity: CameraEventJointEntity,
    object: Partial<CameraEventObject>,
) => {
    edit(entity, {
        beat: object.beat ?? entity.beat,
        cameraLeft: object.cameraLeft ?? entity.cameraLeft,
        cameraSize: object.cameraSize ?? entity.cameraSize,
        cameraZoom: object.cameraZoom ?? entity.cameraZoom,
        cameraZoomTargetLane: object.cameraZoomTargetLane ?? entity.cameraZoomTargetLane,
        cameraZoomTargetY: object.cameraZoomTargetY ?? entity.cameraZoomTargetY,
        cameraZoomVerticalAlign: object.cameraZoomVerticalAlign ?? entity.cameraZoomVerticalAlign,
        cameraRotation: object.cameraRotation ?? entity.cameraRotation,
        cameraStageTilt: object.cameraStageTilt ?? entity.cameraStageTilt,
        eventEase: object.eventEase ?? entity.eventEase,
    })
}

export const editSelectedCameraEvent = (
    transaction: Transaction,
    entity: CameraEventJointEntity,
    object: Partial<CameraEventObject>,
) => {
    removeCameraEventJoint(transaction, entity)
    return addCameraEventJoint(transaction, {
        beat: object.beat ?? entity.beat,
        cameraLeft: object.cameraLeft ?? entity.cameraLeft,
        cameraSize: object.cameraSize ?? entity.cameraSize,
        cameraZoom: object.cameraZoom ?? entity.cameraZoom,
        cameraZoomTargetLane: object.cameraZoomTargetLane ?? entity.cameraZoomTargetLane,
        cameraZoomTargetY: object.cameraZoomTargetY ?? entity.cameraZoomTargetY,
        cameraZoomVerticalAlign: object.cameraZoomVerticalAlign ?? entity.cameraZoomVerticalAlign,
        cameraRotation: object.cameraRotation ?? entity.cameraRotation,
        cameraStageTilt: object.cameraStageTilt ?? entity.cameraStageTilt,
        eventEase: object.eventEase ?? entity.eventEase,
    })
}

const getCameraEventJointFromSelection = () => {
    if (!defaultCameraEventProperties.value.copyProperties) return

    if (selectedEntities.value.length !== 1) return

    const [entity] = selectedEntities.value
    if (entity?.type !== 'cameraEventJoint') return

    return entity
}

const getPropertiesFromSelection = () => {
    const cameraEventJoint = getCameraEventJointFromSelection()

    return {
        cameraSize:
            defaultCameraEventProperties.value.cameraSize ?? cameraEventJoint?.cameraSize ?? 12,
        cameraZoom:
            defaultCameraEventProperties.value.cameraZoom ?? cameraEventJoint?.cameraZoom ?? 1,
        cameraZoomTargetLane:
            defaultCameraEventProperties.value.cameraZoomTargetLane ??
            cameraEventJoint?.cameraZoomTargetLane ??
            0,
        cameraZoomTargetY:
            defaultCameraEventProperties.value.cameraZoomTargetY ??
            cameraEventJoint?.cameraZoomTargetY ??
            0,
        cameraZoomVerticalAlign:
            defaultCameraEventProperties.value.cameraZoomVerticalAlign ??
            cameraEventJoint?.cameraZoomVerticalAlign ??
            'default',
        cameraRotation:
            defaultCameraEventProperties.value.cameraRotation ??
            cameraEventJoint?.cameraRotation ??
            0,
        cameraStageTilt:
            defaultCameraEventProperties.value.cameraStageTilt ??
            cameraEventJoint?.cameraStageTilt ??
            1,
        eventEase:
            defaultCameraEventProperties.value.eventEase ?? cameraEventJoint?.eventEase ?? 'linear',
    }
}

const tryFind = (x: number, y: number): [CameraEventJointEntity] | [undefined, number, number] => {
    const [hit] = hitEntitiesAtPoint('cameraEventJoint', x, y).sort(
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

const add = (object: CameraEventObject) => {
    update(
        interpolate(
            () => i18n.value.tools.events.added,
            '1',
            () => i18n.value.events.cameraEvent,
        ),
        (transaction) => addCameraEventJoint(transaction, object),
    )
}

const edit = (entity: CameraEventJointEntity, object: CameraEventObject) => {
    update(
        interpolate(
            () => i18n.value.tools.events.edited,
            '1',
            () => i18n.value.events.cameraEvent,
        ),
        (transaction) => {
            removeCameraEventJoint(transaction, entity)
            return addCameraEventJoint(transaction, object)
        },
    )
}

const move = (entity: CameraEventJointEntity, object: CameraEventObject) => {
    update(
        interpolate(
            () => i18n.value.tools.events.moved,
            '1',
            () => i18n.value.events.cameraEvent,
        ),
        (transaction) => {
            removeCameraEventJoint(transaction, entity)
            return addCameraEventJoint(transaction, object)
        },
    )
}
