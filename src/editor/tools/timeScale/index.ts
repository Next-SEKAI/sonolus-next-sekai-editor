import type { Tool } from '..'
import type { GroupId } from '../../../chart/groups'
import type { TimeScaleObject } from '../../../chart/timeScale'
import { pushState, replaceState, state } from '../../../history'
import { defaultGroupId } from '../../../history/groups'
import { selectedEntities } from '../../../history/selectedEntities'
import { store } from '../../../history/store'
import { i18n } from '../../../i18n'
import { showModal } from '../../../modals'
import type { Entity } from '../../../state/entities'
import { toTimeScaleEntity, type TimeScaleEntity } from '../../../state/entities/timeScale'
import { addTimeScale, removeTimeScale } from '../../../state/mutations/timeScale'
import { getInStoreGrid } from '../../../state/store/grid'
import { createTransaction, type Transaction } from '../../../state/transaction'
import { interpolate } from '../../../utils/interpolate'
import { notify } from '../../notification'
import { isSidebarVisible } from '../../sidebars'
import { focusViewAtBeat, setViewHover, snapYToBeat, view, yToValidBeat } from '../../view'
import { hitEntitiesAtPoint } from '../utils'
import TimeScalePropertiesModal from './TimeScalePropertiesModal.vue'

let active:
    | {
          type: 'add'
      }
    | {
          type: 'move'
          entity: TimeScaleEntity
      }
    | undefined

export const timeScale: Tool = {
    title: () => i18n.value.tools.timeScale.title,

    hover(x, y) {
        const [entity, beat] = tryFind(x, y)
        if (entity) {
            view.entities = {
                hovered: [entity],
                creating: [],
            }
        } else {
            view.entities = {
                hovered: [],
                creating: [
                    toTimeScaleEntity({
                        groupId: view.groupId ?? defaultGroupId.value,
                        beat,
                        timeScale: 1,
                        skip: 0,
                        timeScaleEase: 'none',
                        hideNotes: false,
                    }),
                ],
            }
        }
    },

    tap(x, y, modifiers) {
        const [entity, beat] = tryFind(x, y)
        if (entity) {
            if (modifiers.ctrl) {
                const selectedTimeScaleEntities: Entity[] = selectedEntities.value.filter(
                    (entity) => entity.type === 'timeScale',
                )

                const targets = selectedTimeScaleEntities.includes(entity)
                    ? selectedTimeScaleEntities.filter((e) => e !== entity)
                    : [...selectedTimeScaleEntities, entity]

                replaceState({
                    ...state.value,
                    selectedEntities: targets,
                })
                view.entities = {
                    hovered: [],
                    creating: [],
                }
                focusViewAtBeat(entity.beat)

                notify(interpolate(() => i18n.value.tools.timeScale.selected, `${targets.length}`))
            } else {
                if (selectedEntities.value.includes(entity)) {
                    focusViewAtBeat(entity.beat)

                    if (isSidebarVisible.value) {
                        editMoveOrReplace(entity, {
                            groupId: entity.groupId,
                            beat: entity.beat,
                            timeScale: entity.timeScale,
                            skip: entity.skip,
                            ...(entity.timeScaleEase === 'none' && !entity.hideNotes
                                ? {
                                      timeScaleEase: 'linear',
                                      hideNotes: false,
                                  }
                                : entity.timeScaleEase === 'linear' && !entity.hideNotes
                                  ? {
                                        timeScaleEase: 'none',
                                        hideNotes: true,
                                    }
                                  : {
                                        timeScaleEase: 'none',
                                        hideNotes: false,
                                    }),
                        })
                    } else {
                        void showModal(TimeScalePropertiesModal, {})
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

                    notify(interpolate(() => i18n.value.tools.timeScale.selected, '1'))
                }
            }
        } else {
            const object: TimeScaleObject = {
                groupId: view.groupId ?? defaultGroupId.value,
                beat,
                timeScale: 1,
                skip: 0,
                timeScaleEase: 'none',
                hideNotes: false,
            }

            const overlap = find(view.groupId, object.beat)
            if (overlap) {
                edit(overlap, object)
            } else {
                add(object)
            }
            focusViewAtBeat(object.beat)

            void showModal(TimeScalePropertiesModal, {})
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

            notify(interpolate(() => i18n.value.tools.timeScale.moving, '1'))

            active = {
                type: 'move',
                entity,
            }
        } else {
            focusViewAtBeat(beat)

            notify(interpolate(() => i18n.value.tools.timeScale.adding, '1'))

            active = {
                type: 'add',
            }
        }

        return true
    },

    dragUpdate(x, y) {
        if (!active) return

        setViewHover(y)

        switch (active.type) {
            case 'add': {
                const [entity, beat] = tryFind(x, y)
                if (entity) {
                    view.entities = {
                        hovered: [entity],
                        creating: [],
                    }
                    focusViewAtBeat(entity.beat)
                } else {
                    view.entities = {
                        hovered: [],
                        creating: [
                            toTimeScaleEntity({
                                groupId: view.groupId ?? defaultGroupId.value,
                                beat,
                                timeScale: 1,
                                skip: 0,
                                timeScaleEase: 'none',
                                hideNotes: false,
                            }),
                        ],
                    }
                    focusViewAtBeat(beat)
                }
                break
            }
            case 'move': {
                const beat = snapYToBeat(y, active.entity.beat)

                view.entities = {
                    hovered: [],
                    creating: [
                        toTimeScaleEntity({
                            groupId: active.entity.groupId,
                            beat,
                            timeScale: active.entity.timeScale,
                            skip: active.entity.skip,
                            timeScaleEase: active.entity.timeScaleEase,
                            hideNotes: false,
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

        switch (active.type) {
            case 'add': {
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

                    void showModal(TimeScalePropertiesModal, {})
                } else {
                    const object: TimeScaleObject = {
                        groupId: view.groupId ?? defaultGroupId.value,
                        beat,
                        timeScale: 1,
                        skip: 0,
                        timeScaleEase: 'none',
                        hideNotes: false,
                    }

                    const overlap = find(view.groupId, object.beat)
                    if (overlap) {
                        edit(overlap, object)
                    } else {
                        add(object)
                    }
                    focusViewAtBeat(object.beat)

                    void showModal(TimeScalePropertiesModal, {})
                }
                break
            }
            case 'move': {
                const beat = snapYToBeat(y, active.entity.beat)

                editMoveOrReplace(active.entity, {
                    groupId: active.entity.groupId,
                    beat,
                    timeScale: active.entity.timeScale,
                    skip: active.entity.skip,
                    timeScaleEase: active.entity.timeScaleEase,
                    hideNotes: active.entity.hideNotes,
                })
                focusViewAtBeat(beat)
                break
            }
        }

        active = undefined
    },
}

export const editTimeScale = (entity: TimeScaleEntity, object: Partial<TimeScaleObject>) => {
    editMoveOrReplace(entity, {
        groupId: object.groupId ?? entity.groupId,
        beat: object.beat ?? entity.beat,
        timeScale: object.timeScale ?? entity.timeScale,
        skip: object.skip ?? entity.skip,
        timeScaleEase: object.timeScaleEase ?? entity.timeScaleEase,
        hideNotes: object.hideNotes ?? entity.hideNotes,
    })
}

export const editSelectedTimeScale = (
    transaction: Transaction,
    entity: TimeScaleEntity,
    object: Partial<TimeScaleObject>,
) => {
    removeTimeScale(transaction, entity)
    return addTimeScale(transaction, {
        groupId: object.groupId ?? entity.groupId,
        beat: object.beat ?? entity.beat,
        timeScale: object.timeScale ?? entity.timeScale,
        skip: object.skip ?? entity.skip,
        timeScaleEase: object.timeScaleEase ?? entity.timeScaleEase,
        hideNotes: object.hideNotes ?? entity.hideNotes,
    })
}

const find = (groupId: GroupId | undefined, beat: number) =>
    getInStoreGrid(store.value.grid, 'timeScale', beat)?.find(
        (entity) => entity.beat === beat && (groupId === undefined || entity.groupId === groupId),
    )

const tryFind = (x: number, y: number): [TimeScaleEntity] | [undefined, number] => {
    const [hit] = hitEntitiesAtPoint('timeScale', x, y).sort(
        (a, b) => +selectedEntities.value.includes(b) - +selectedEntities.value.includes(a),
    )
    if (hit) return [hit]

    const beat = yToValidBeat(y)
    const nearest = find(view.groupId, beat)
    if (nearest) return [nearest]

    return [undefined, beat]
}

const editMoveOrReplace = (entity: TimeScaleEntity, object: TimeScaleObject) => {
    if (entity.beat === object.beat) {
        edit(entity, object)
        return
    }

    const overlap = find(object.groupId, object.beat)
    if (overlap) {
        replace(overlap, object, entity)
    } else {
        move(object, entity)
    }
    focusViewAtBeat(object.beat)
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

const add = (object: TimeScaleObject) => {
    update(
        () => i18n.value.tools.timeScale.added,
        (transaction) => {
            return addTimeScale(transaction, object)
        },
    )
}

const edit = (entity: TimeScaleEntity, object: TimeScaleObject) => {
    update(
        () => i18n.value.tools.timeScale.edited,
        (transaction) => {
            removeTimeScale(transaction, entity)
            return addTimeScale(transaction, object)
        },
    )
}

const move = (object: TimeScaleObject, old: TimeScaleEntity) => {
    update(
        () => i18n.value.tools.timeScale.moved,
        (transaction) => {
            removeTimeScale(transaction, old)
            return addTimeScale(transaction, object)
        },
    )
}

const replace = (entity: TimeScaleEntity, object: TimeScaleObject, old: TimeScaleEntity) => {
    update(
        () => i18n.value.tools.timeScale.replaced,
        (transaction) => {
            removeTimeScale(transaction, old)
            removeTimeScale(transaction, entity)
            return addTimeScale(transaction, object)
        },
    )
}
