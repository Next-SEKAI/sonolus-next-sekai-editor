import { computed } from 'vue'
import { state } from '.'

export const filename = computed(() => state.value.filename ?? state.value.bgm.filename)
