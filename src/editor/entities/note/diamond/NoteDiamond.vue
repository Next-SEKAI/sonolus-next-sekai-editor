<script setup lang="ts">
import { noteSurfaceColors } from '../../../../utils/colors'

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
    <g v-if="size > 0" :transform="`translate(${size / 2}, 0.3)`">
        <polygon points="-0.3,0 0,-0.3 0.3,0 0,0.15" :fill="noteSurfaceColors[color]" />
        <polygon points="-0.25,0 0,-0.25 0,0.1" fill="#fff" />
    </g>
</template>
