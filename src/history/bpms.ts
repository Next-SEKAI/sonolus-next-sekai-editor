import { computed } from 'vue'
import { state } from '.'

export const bpms = computed(() => state.value.bpms)
