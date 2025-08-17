<script setup lang="ts">
import type { Gradient } from './color'

defineProps<Gradient>()
</script>

<template>
    <defs>
        <linearGradient :id x1="0" x2="0" y1="1" y2="0">
            <stop offset="0%" :stop-color="color" :stop-opacity="headAlpha" />
            <stop offset="100%" :stop-color="color" :stop-opacity="tailAlpha" />
        </linearGradient>
    </defs>
</template>
