import { computed } from 'vue'
import { state } from '.'

export const stages = computed(() => state.value.stages)

export const defaultStageId = computed(() => {
    const [id] = [...stages.value.keys()]
    if (!id) throw new Error('Unexpected missing default stage')

    return id
})
