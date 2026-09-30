<script setup lang="ts">
import { noteAccentColors, noteBorderColors, noteSurfaceColors } from '../../../../../utils/colors'

defineProps<{
    color:
        | 'tap'
        | 'hold'
        | 'flick'
        | 'critical'
        | 'neutral'
        | 'red'
        | 'green'
        | 'blue'
        | 'yellow'
        | 'purple'
        | 'cyan'
        | 'black'
}>()
</script>

<template>
    <rect
        x="-0.5"
        y="-0.3"
        width="1"
        height="0.6"
        rx="0.1"
        ry="0.1"
        :stroke="noteBorderColors[color]"
        stroke-width="0.1"
        :fill="noteSurfaceColors[color]"
    />
    <rect x="-0.5" y="-0.1" width="0.2" height="0.2" :fill="noteAccentColors[color]" />
    <rect x="0.3" y="-0.1" width="0.2" height="0.2" :fill="noteAccentColors[color]" />
</template>
