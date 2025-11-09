<script setup lang="ts">
import type { DefaultNoteSlideProperties } from '../../../../settings'
import { bodyComponents } from './body'
import { diamondComponents } from './diamond'
import { fakeMarkerComponent } from './fakeMarker'
import { slideConnectorComponent } from './slideConnector'

defineProps<{
    properties: DefaultNoteSlideProperties
}>()
</script>

<template>
    <component :is="slideConnectorComponent" :properties />
    <component :is="bodyComponents.none" />
    <component :is="diamondComponents[properties.isCritical ? 'yellow' : 'green']" />
    <component :is="fakeMarkerComponent" v-if="properties.isFake" />
</template>
