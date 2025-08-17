<script setup lang="ts">
import type { NoteEntity } from '../../../state/entities/slides/note'
import { bodyComponents } from './body'
import { fakeMarkerComponent } from './fakeMarker'

defineProps<{
    entity: NoteEntity
    isHighlighted: boolean
}>()
</script>

<template>
    <component :is="bodyComponents.damage" :size="entity.size" />
    <component :is="fakeMarkerComponent" v-if="entity.isFake" :size="entity.size" />
</template>
