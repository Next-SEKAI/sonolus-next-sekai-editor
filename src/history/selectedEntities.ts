import { computed } from 'vue'
import { state } from '.'

export const selectedEntities = computed(() => state.value.selectedEntities)
