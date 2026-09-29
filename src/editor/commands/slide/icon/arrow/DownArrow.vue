<script setup lang="ts">
import { noteAccentColors } from '../../../../../utils/colors'

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
    <g transform="translate(0, -0.15) scale(0.3, 0.3)">
        <polygon
            points="-1,-1.2 -1,-0.8 0,-0.2 1,-0.8 1,-1.2 0,-0.6"
            :fill="noteAccentColors[color]"
        />
    </g>
</template>
