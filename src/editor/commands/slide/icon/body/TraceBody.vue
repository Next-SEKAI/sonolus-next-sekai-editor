<script setup lang="ts">
import { noteBorderColors } from '../../../../../utils/colors'

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
        y="-0.15"
        width="1"
        height="0.3"
        rx="0.1"
        ry="0.1"
        :fill="noteBorderColors[color]"
    />
</template>
