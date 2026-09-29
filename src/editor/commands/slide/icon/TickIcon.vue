<script setup lang="ts">
import type { DefaultNoteSlideProperties } from '../../../../settings'
import { bodyComponents } from './body'
import { diamondComponent } from './diamond'
import { fakeMarkerComponent } from './fakeMarker'
import { slideConnectorComponent } from './slideConnector'

defineProps<{
    properties: DefaultNoteSlideProperties
}>()
</script>

<template>
    <component :is="slideConnectorComponent" :properties />
    <component :is="bodyComponents.none" />
    <component
        :is="diamondComponent"
        :color="
            properties.noteColor && properties.noteColor !== 'default'
                ? properties.noteColor
                : properties.isCritical
                  ? 'critical'
                  : 'hold'
        "
    />
    <component :is="fakeMarkerComponent" v-if="properties.isFake" />
</template>
