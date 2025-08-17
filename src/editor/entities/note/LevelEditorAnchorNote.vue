<script setup lang="ts">
import type { NoteEntity } from '../../../state/entities/slides/note'
import { bodyComponents } from './body'

defineProps<{
    entity: NoteEntity
    isHighlighted: boolean
}>()
</script>

<template>
    <component :is="bodyComponents.none" :size="entity.size" :is-highlighted="isHighlighted" />
</template>
