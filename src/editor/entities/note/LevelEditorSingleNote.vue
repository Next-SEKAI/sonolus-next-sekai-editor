<script setup lang="ts">
import type { NoteEntity } from '../../../state/entities/slides/note'
import { arrowComponents } from './arrow'
import { bodyComponents } from './body'
import { fakeMarkerComponent } from './fakeMarker'

defineProps<{
    entity: NoteEntity
    isHighlighted: boolean
}>()
</script>

<template>
    <component
        :is="bodyComponents.single"
        :color="
            entity.noteColor !== 'default'
                ? entity.noteColor
                : entity.isCritical
                  ? 'critical'
                  : entity.flickDirection !== 'none'
                    ? 'flick'
                    : 'tap'
        "
        :size="entity.size"
    />
    <component
        :is="arrowComponents[entity.flickDirection]"
        v-if="entity.flickDirection !== 'none'"
        :color="
            entity.noteColor !== 'default'
                ? entity.noteColor
                : entity.isCritical
                  ? 'critical'
                  : 'flick'
        "
        :size="entity.size"
    />
    <component :is="fakeMarkerComponent" v-if="entity.isFake" :size="entity.size" />
</template>
