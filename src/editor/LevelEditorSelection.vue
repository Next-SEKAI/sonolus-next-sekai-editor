<script setup lang="ts">
import { ups, view } from './view'
</script>

<template>
    <rect
        v-if="view.selection"
        :x="view.selection.laneMin"
        :y="view.selection.timeMax * ups"
        :width="view.selection.laneMax - view.selection.laneMin"
        :height="(view.selection.timeMin - view.selection.timeMax) * ups"
        stroke="#fff"
        stroke-opacity="0.5"
        stroke-dasharray="6 4"
        fill="#fff"
        fill-opacity="0.25"
    />
</template>
