import { computed } from 'vue'
import { state } from '.'

export const groups = computed(() => state.value.groups)

export const defaultGroupId = computed(() => {
    const [id] = [...groups.value.keys()]
    if (!id) throw new Error('Unexpected missing default group')

    return id
})
