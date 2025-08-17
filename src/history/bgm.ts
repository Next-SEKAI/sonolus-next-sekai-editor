import { computed } from 'vue'
import { state } from '.'

export const bgm = computed(() => state.value.bgm)
