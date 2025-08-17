<script setup lang="ts">
import { isViewRecentlyActive } from '../../../view'

defineProps<{
    size: number
    isHighlighted: boolean
}>()
</script>

<template>
    <rect
        v-if="isHighlighted || isViewRecentlyActive"
        x="0"
        y="0.2"
        :width="size"
        height="0.4"
        rx="0.1"
        ry="0.1"
        stroke="#fff"
    />
</template>
