<script setup lang="ts">
import type { DefaultNoteSlideProperties } from '../../../../settings'
import { bodyComponents } from './body'
import { fakeMarkerComponent } from './fakeMarker'

defineProps<{
    properties: DefaultNoteSlideProperties
}>()
</script>

<template>
    <component :is="bodyComponents.damage" />
    <component :is="fakeMarkerComponent" v-if="properties.isFake" />
</template>
