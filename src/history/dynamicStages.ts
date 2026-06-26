import { computed } from 'vue'
import { notify } from '../editor/notification.ts'
import { i18n } from '../i18n/index.ts'
import ConfirmModal from '../modals/ConfirmModal.vue'
import { showModal } from '../modals/index.ts'
import { addStageMaskEventJoint } from '../state/mutations/events/stage/mask'
import { addStagePivotEventJoint } from '../state/mutations/events/stage/pivot'
import { addStageStyleEventJoint } from '../state/mutations/events/stage/style'
import { createTransaction } from '../state/transaction'
import { pushState, state } from './index.ts'
import { selectedEntities } from './selectedEntities'
import { defaultStageId } from './stages'

export const isDynamicStages = computed(() => state.value.isDynamicStages)

export const checkDynamicStages = async () => {
    if (isDynamicStages.value) return true

    const result = await showModal(ConfirmModal, {
        title: () => i18n.value.history.dynamicStages.title,
        message: () => i18n.value.history.dynamicStages.message,
    })
    if (!result) return false

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (isDynamicStages.value) return true

    const transaction = createTransaction(state.value)

    addStageMaskEventJoint(transaction, {
        stageId: defaultStageId.value,
        beat: 0,
        maskLeft: -6,
        maskSize: 12,
        eventEase: 'linear',
    })
    addStagePivotEventJoint(transaction, {
        stageId: defaultStageId.value,
        beat: 0,
        pivotLane: 0,
        divisionSize: 2,
        divisionParity: 'even',
        yOffset: 0,
        yOffsetBeat: 0,
        eventEase: 'linear',
    })
    addStageStyleEventJoint(transaction, {
        stageId: defaultStageId.value,
        beat: 0,
        editorLane: 0,
        judgmentLineColor: 'purple',
        leftBorderStyle: 'default',
        rightBorderStyle: 'default',
        stageAlpha: 1,
        laneAlpha: 1,
        judgmentLineAlpha: 1,
        eventEase: 'linear',
    })

    pushState(() => i18n.value.history.dynamicStages.enabled, {
        ...transaction.commit(selectedEntities.value),
        isDynamicStages: true,
    })

    notify(() => i18n.value.history.dynamicStages.enabled)

    return true
}
