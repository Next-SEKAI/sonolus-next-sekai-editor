<script setup lang="ts">
import { ups, view } from './view'
</script>

<template>
    <line
        :transform="`translate(0, ${view.hoverTime * ups})`"
        :x1="-6"
        :x2="6"
        y1="0"
        y2="0"
        stroke="#fff"
        stroke-opacity="0.5"
        stroke-dasharray="6 4"
    />
</template>
