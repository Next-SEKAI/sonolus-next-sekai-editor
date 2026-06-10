import { computed } from 'vue'
import { notify } from '../editor/notification.ts'
import { i18n } from '../i18n/index.ts'
import ConfirmModal from '../modals/ConfirmModal.vue'
import { showModal } from '../modals/index.ts'
import { pushState, state } from './index.ts'

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

    pushState(() => i18n.value.history.dynamicStages.enabled, {
        ...state.value,
        isDynamicStages: true,
    })

    notify(() => i18n.value.history.dynamicStages.enabled)

    return true
}
