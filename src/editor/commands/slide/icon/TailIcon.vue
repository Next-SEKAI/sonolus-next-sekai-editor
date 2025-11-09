<script setup lang="ts">
import type { DefaultNoteSlideProperties } from '../../../../settings'
import { arrowComponents } from './arrow'
import { bodyComponents } from './body'
import { fakeMarkerComponent } from './fakeMarker'
import { slideConnectorComponent } from './slideConnector'

defineProps<{
    properties: DefaultNoteSlideProperties
}>()
</script>

<template>
    <component :is="slideConnectorComponent" :properties />
    <component
        :is="
            bodyComponents.single[
                properties.isCritical
                    ? 'yellow'
                    : properties.flickDirection && properties.flickDirection !== 'none'
                      ? 'red'
                      : 'green'
            ]
        "
    />
    <component
        :is="arrowComponents[properties.isCritical ? 'yellow' : 'red'][properties.flickDirection]"
        v-if="properties.flickDirection && properties.flickDirection !== 'none'"
    />
    <component :is="fakeMarkerComponent" v-if="properties.isFake" />
</template>
