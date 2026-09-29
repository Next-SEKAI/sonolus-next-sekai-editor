<script setup lang="ts">
import type { DefaultNoteSlideProperties } from '../../../../settings'
import { arrowComponents } from './arrow'
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
    <component
        :is="bodyComponents.trace"
        :color="
            properties.noteColor && properties.noteColor !== 'default'
                ? properties.noteColor
                : properties.isCritical
                  ? 'critical'
                  : properties.flickDirection && properties.flickDirection !== 'none'
                    ? 'flick'
                    : 'hold'
        "
    />
    <component
        :is="diamondComponent"
        :color="
            properties.noteColor && properties.noteColor !== 'default'
                ? properties.noteColor
                : properties.isCritical
                  ? 'critical'
                  : properties.flickDirection && properties.flickDirection !== 'none'
                    ? 'flick'
                    : 'hold'
        "
    />
    <component
        :is="arrowComponents[properties.flickDirection]"
        v-if="properties.flickDirection && properties.flickDirection !== 'none'"
        :color="
            properties.noteColor && properties.noteColor !== 'default'
                ? properties.noteColor
                : properties.isCritical
                  ? 'critical'
                  : 'flick'
        "
    />
    <component :is="fakeMarkerComponent" v-if="properties.isFake" />
</template>
