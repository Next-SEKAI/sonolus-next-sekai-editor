<script setup lang="ts">
import type { NoteEntity } from '../../../state/entities/slides/note'
import { bodyComponents } from './body'
import { diamondComponents } from './diamond'
import { fakeMarkerComponent } from './fakeMarker'

defineProps<{
    entity: NoteEntity
    isHighlighted: boolean
}>()
</script>

<template>
    <component :is="bodyComponents.none" :size="entity.size" :is-highlighted="isHighlighted" />
    <component
        :is="diamondComponents[entity.isCritical ? 'yellow' : 'green']"
        :size="entity.size"
    />
    <component :is="fakeMarkerComponent" v-if="entity.isFake" :size="entity.size" />
</template>
