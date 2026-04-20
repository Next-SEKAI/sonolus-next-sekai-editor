import { computed } from 'vue'
import { state } from '.'

export const initialLife = computed(() => state.value.initialLife)
