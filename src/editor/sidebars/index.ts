import { computed, ref } from 'vue'
import { screenSm } from '../../screen'
import { settings } from '../../settings'

export const currentSidebar = ref<Element | null>(null)

export const isSidebarVisible = computed(() => screenSm.value && settings.showSidebar)

export const focusDefaultSidebar = () => {
    setTimeout(() => {
        currentSidebar.value?.firstElementChild?.firstElementChild?.querySelector('label')?.focus()
    }, 0)
}

export const focusSidebar = () => {
    setTimeout(() => {
        currentSidebar.value?.firstElementChild?.lastElementChild?.querySelector('label')?.focus()
    }, 0)
}
