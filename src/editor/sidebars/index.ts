import { computed, ref } from 'vue'
import { screenSm } from '../../screen'
import { settings } from '../../settings'

export const currentSidebar = ref<Element | null>(null)

export const isSidebarVisible = computed(() => screenSm.value && settings.showSidebar)
