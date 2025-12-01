import type { Tool } from '..'
import type { BpmObject } from '../../../chart'
import { pushState, replaceState, state } from '../../../history'
import { selectedEntities } from '../../../history/selectedEntities'
import { store } from '../../../history/store'
import { i18n } from '../../../i18n'
import { showModal } from '../../../modals'
import type { Entity } from '../../../state/entities'
import { toBpmEntity, type BpmEntity } from '../../../state/entities/bpm'
import { addBpm, removeBpm } from '../../../state/mutations/bpm'
import { getInStoreGrid } from '../../../state/store/grid'
import { createTransaction, type Transaction } from '../../../state/transaction'
import { interpolate } from '../../../utils/interpolate'
import { notify } from '../../notification'
import { isSidebarVisible } from '../../sidebars'
import { focusViewAtBeat, setViewHover, snapYToBeat, view, yToValidBeat } from '../../view'
import { hitEntitiesAtPoint } from '../utils'
import BpmPropertiesModal from './BpmPropertiesModal.vue'

let active:
    | {
          type: 'add'
      }
    | {
          type: 'move'
          entity: BpmEntity
      }
    | undefined

export const bpm: Tool = {
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
                    toBpmEntity({
                        beat,
                        bpm: 60,
                    }),
                ],
            }
        }
    },

    tap(x, y, modifiers) {
        const [entity, beat] = tryFind(x, y)
        if (entity) {
            if (modifiers.ctrl) {
                const selectedBpmEntities: Entity[] = selectedEntities.value.filter(
                    (entity) => entity.type === 'bpm',
                )

                const targets = selectedBpmEntities.includes(entity)
                    ? selectedBpmEntities.filter((e) => e !== entity)
                    : [...selectedBpmEntities, entity]

                replaceState({
                    ...state.value,
                    selectedEntities: targets,
                })
                view.entities = {
                    hovered: [],
                    creating: [],
                }
                focusViewAtBeat(entity.beat)

                notify(interpolate(() => i18n.value.tools.bpm.selected, `${targets.length}`))
            } else {
                if (selectedEntities.value.includes(entity)) {
                    focusViewAtBeat(entity.beat)

                    if (!isSidebarVisible.value) {
                        void showModal(BpmPropertiesModal, {})
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

                    notify(interpolate(() => i18n.value.tools.bpm.selected, '1'))
                }
            }
        } else {
            const object: BpmObject = {
                beat,
                bpm: 60,
            }

            const overlap = find(object.beat)
            if (overlap) {
                edit(overlap, object)
            } else {
                add(object)
            }
            focusViewAtBeat(object.beat)

            void showModal(BpmPropertiesModal, {})
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

            notify(interpolate(() => i18n.value.tools.bpm.moving, '1'))

            active = {
                type: 'move',
                entity,
            }
        } else {
            focusViewAtBeat(beat)

            notify(interpolate(() => i18n.value.tools.bpm.adding, '1'))

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
                            toBpmEntity({
                                beat,
                                bpm: 60,
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
                        toBpmEntity({
                            beat,
                            bpm: active.entity.bpm,
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

                    void showModal(BpmPropertiesModal, {})
                } else {
                    const object: BpmObject = {
                        beat,
                        bpm: 60,
                    }

                    const overlap = find(object.beat)
                    if (overlap) {
                        edit(overlap, object)
                    } else {
                        add(object)
                    }
                    focusViewAtBeat(object.beat)

                    void showModal(BpmPropertiesModal, {})
                }
                break
            }
            case 'move': {
                const beat = snapYToBeat(y, active.entity.beat)

                editMoveOrReplace(active.entity, {
                    beat,
                    bpm: active.entity.bpm,
                })
                focusViewAtBeat(beat)
                break
            }
        }

        active = undefined
    },
}

export const editBpm = (entity: BpmEntity, object: Partial<BpmObject>) => {
    editMoveOrReplace(entity, {
        beat: object.beat ?? entity.beat,
        bpm: object.bpm ?? entity.bpm,
    })
}

export const editSelectedBpm = (
    transaction: Transaction,
    entity: BpmEntity,
    object: Partial<BpmObject>,
) => {
    removeBpm(transaction, entity)
    return addBpm(transaction, {
        beat: object.beat ?? entity.beat,
        bpm: object.bpm ?? entity.bpm,
    })
}

const find = (beat: number) =>
    getInStoreGrid(store.value.grid, 'bpm', beat)?.find((entity) => entity.beat === beat)

const tryFind = (x: number, y: number): [BpmEntity] | [undefined, number] => {
    const [hit] = hitEntitiesAtPoint('bpm', x, y).sort(
        (a, b) => +selectedEntities.value.includes(b) - +selectedEntities.value.includes(a),
    )
    if (hit) return [hit]

    const beat = yToValidBeat(y)
    const nearest = find(beat)
    if (nearest) return [nearest]

    return [undefined, beat]
}

const editMoveOrReplace = (entity: BpmEntity, object: BpmObject) => {
    if (entity.beat === object.beat) {
        edit(entity, object)
        return
    }

    const overlap = find(object.beat)
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

const add = (object: BpmObject) => {
    update(
        () => i18n.value.tools.bpm.added,
        (transaction) => {
            return addBpm(transaction, object)
        },
    )
}

const edit = (entity: BpmEntity, object: BpmObject) => {
    update(
        () => i18n.value.tools.bpm.edited,
        (transaction) => {
            removeBpm(transaction, entity)
            return addBpm(transaction, object)
        },
    )
}

const move = (object: BpmObject, old: BpmEntity) => {
    update(
        () => i18n.value.tools.bpm.moved,
        (transaction) => {
            if (old.beat) removeBpm(transaction, old)
            return addBpm(transaction, object)
        },
    )
}

const replace = (entity: BpmEntity, object: BpmObject, old: BpmEntity) => {
    update(
        () => i18n.value.tools.bpm.replaced,
        (transaction) => {
            if (old.beat) removeBpm(transaction, old)
            removeBpm(transaction, entity)
            return addBpm(transaction, object)
        },
    )
}
