<script setup lang="ts">
import type { NoteEntity } from '../../../state/entities/slides/note'
import { arrowComponents } from './arrow'
import { bodyComponents } from './body'
import { diamondComponents } from './diamond'
import { fakeMarkerComponent } from './fakeMarker'

defineProps<{
    entity: NoteEntity
    isHighlighted: boolean
}>()
</script>

<template>
    <component
        :is="
            bodyComponents.trace[
                entity.isCritical ? 'yellow' : entity.flickDirection !== 'none' ? 'red' : 'green'
            ]
        "
        :size="entity.size"
    />
    <component
        :is="
            diamondComponents[
                entity.isCritical ? 'yellow' : entity.flickDirection !== 'none' ? 'red' : 'green'
            ]
        "
        :size="entity.size"
    />
    <component
        :is="arrowComponents[entity.isCritical ? 'yellow' : 'red'][entity.flickDirection]"
        v-if="entity.flickDirection !== 'none'"
        :size="entity.size"
    />
    <component :is="fakeMarkerComponent" v-if="entity.isFake" :size="entity.size" />
</template>
