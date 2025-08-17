import { computed, ref, watch } from 'vue'
import { time } from './time'

export const screenWidth = ref(0)

export const screenSm = computed(() => screenWidth.value >= 640)

watch(time, () => {
    screenWidth.value = document.documentElement.clientWidth
})
