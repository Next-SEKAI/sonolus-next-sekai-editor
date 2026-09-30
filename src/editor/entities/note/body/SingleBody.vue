<script setup lang="ts">
import { noteAccentColors, noteBorderColors, noteSurfaceColors } from '../../../../utils/colors'

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
    size: number
}>()
</script>

<template>
    <template v-if="size > 0">
        <rect
            x="0"
            y="0"
            :width="size"
            height="0.6"
            rx="0.1"
            ry="0.1"
            :fill="noteBorderColors[color]"
        />
        <rect
            x="0.1"
            y="0.1"
            :width="size - 0.2"
            height="0.4"
            rx="0.1"
            ry="0.1"
            :fill="noteSurfaceColors[color]"
        />
        <rect x="0.1" y="0.225" width="0.15" height="0.15" :fill="noteAccentColors[color]" />
        <rect
            :x="size - 0.25"
            y="0.225"
            width="0.15"
            height="0.15"
            :fill="noteAccentColors[color]"
        />
    </template>
    <template v-else>
        <rect
            x="-0.1"
            y="0"
            width="0.2"
            height="0.6"
            rx="0.1"
            ry="0.1"
            :fill="noteBorderColors[color]"
        />
    </template>
</template>
