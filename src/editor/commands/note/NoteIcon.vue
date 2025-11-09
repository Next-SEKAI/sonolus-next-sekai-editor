<script setup lang="ts">
import { computed } from 'vue'
import { settings } from '../../../settings'
import { defaultNotePropertiesPresetIndex } from '../../tools/note'
import { iconComponents } from './icon'

const props = defineProps<{
    index?: number
}>()

const properties = computed(
    () =>
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        settings.defaultNotePropertiesPresets[
            props.index ?? defaultNotePropertiesPresetIndex.value
        ]!,
)

const type = computed(() => {
    const noteType = properties.value.noteType

    if (noteType === 'trace') return 'trace'

    if (noteType === 'anchor') return 'anchor'

    if (noteType === 'damage') return 'damage'

    if (noteType === 'forceTick') return 'tick'

    return 'single'
})
</script>

<template>
    <svg viewBox="-0.55 -0.55 1.1 1.1">
        <component :is="iconComponents[type]" :properties />
        <text
            v-if="index !== undefined"
            x="0"
            y="0"
            font-size="0.5"
            text-anchor="middle"
            dominant-baseline="middle"
        >
            {{ index + 1 }}
        </text>
    </svg>
</template>
