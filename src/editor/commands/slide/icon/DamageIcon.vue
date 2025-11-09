<script setup lang="ts">
import type { DefaultNoteSlideProperties } from '../../../../settings'
import { bodyComponents } from './body'
import { fakeMarkerComponent } from './fakeMarker'
import { slideConnectorComponent } from './slideConnector'

defineProps<{
    properties: DefaultNoteSlideProperties
}>()
</script>

<template>
    <component :is="slideConnectorComponent" :properties />
    <component :is="bodyComponents.damage" />
    <component :is="fakeMarkerComponent" v-if="properties.isFake" />
</template>
