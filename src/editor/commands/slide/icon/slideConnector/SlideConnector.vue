<script setup lang="ts">
import type { DefaultNoteSlideProperties } from '../../../../../settings'
import { connectorColors } from '../../../../../utils/colors'

defineProps<{
    properties: DefaultNoteSlideProperties
}>()
</script>

<template>
    <rect
        x="-0.5"
        y="0"
        width="1"
        height="0.55"
        :fill="
            connectorColors[
                properties.connectorColor && properties.connectorColor !== 'default'
                    ? properties.connectorColor
                    : properties.connectorType === 'guide'
                      ? 'green'
                      : properties.connectorType === 'damage'
                        ? 'damage'
                        : (properties.connectorActiveIsCritical ?? properties.isCritical)
                          ? 'critical'
                          : 'normal'
            ]
        "
        :fill-opacity="properties.connectorType === 'guide' ? 0.5 : 0.8"
    />
    <template v-if="properties.connectorIsFake ?? properties.isFake">
        <line x1="-0.5" y1="0" x2="0.5" y2="0.55" stroke="#f44" stroke-width="0.1" />
        <line x1="-0.5" y1="0.55" x2="0.5" y2="0" stroke="#f44" stroke-width="0.1" />
    </template>
</template>
