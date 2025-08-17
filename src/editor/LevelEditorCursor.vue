<script setup lang="ts">
import { ups, view } from './view'
</script>

<template>
    <line
        :transform="`translate(0, ${view.cursorTime * ups})`"
        :x1="-7"
        :x2="7"
        y1="0"
        y2="0"
        stroke="#fff"
    />
</template>
