<script setup lang="ts">
import type { DefaultNoteSlideProperties } from '../../../../../settings'
import { activeColors, guideColors } from '../../../../../utils/colors'

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
            properties.connectorType === 'guide'
                ? guideColors[properties.connectorGuideColor ?? 'green']
                : activeColors[
                      (properties.connectorActiveIsCritical ?? properties.isCritical)
                          ? 'critical'
                          : 'normal'
                  ]
        "
        :fill-opacity="properties.connectorType === 'guide' ? 0.5 : 0.8"
    />
    <template v-if="properties.connectorActiveIsFake ?? properties.isFake">
        <line x1="-0.5" y1="0" x2="0.5" y2="0.55" stroke="#f44" stroke-width="0.1" />
        <line x1="-0.5" y1="0.55" x2="0.5" y2="0" stroke="#f44" stroke-width="0.1" />
    </template>
</template>
