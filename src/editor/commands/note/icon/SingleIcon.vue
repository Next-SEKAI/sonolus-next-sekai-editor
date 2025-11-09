<script setup lang="ts">
import type { DefaultNoteSlideProperties } from '../../../../settings'
import { arrowComponents } from './arrow'
import { bodyComponents } from './body'
import { fakeMarkerComponent } from './fakeMarker'

defineProps<{
    properties: DefaultNoteSlideProperties
}>()
</script>

<template>
    <component
        :is="
            bodyComponents.single[
                properties.isCritical
                    ? 'yellow'
                    : properties.flickDirection && properties.flickDirection !== 'none'
                      ? 'red'
                      : 'cyan'
            ]
        "
    />
    <component
        :is="arrowComponents[properties.isCritical ? 'yellow' : 'red'][properties.flickDirection]"
        v-if="properties.flickDirection && properties.flickDirection !== 'none'"
    />
    <component :is="fakeMarkerComponent" v-if="properties.isFake" />
</template>
