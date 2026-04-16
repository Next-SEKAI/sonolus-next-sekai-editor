import { computed } from 'vue'
import { state } from '.'

export const groups = computed(() => state.value.groups)

export const defaultGroup = computed(() => {
    const [group] = [...groups.value.keys()]
    if (!group) throw new Error('Unexpected missing default group')

    return group
})
