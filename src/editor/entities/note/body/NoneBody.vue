<script setup lang="ts">
import { isViewRecentlyActive } from '../../../view'

defineProps<{
    size: number
    isHighlighted: boolean
}>()
</script>

<template>
    <template v-if="isHighlighted || isViewRecentlyActive">
        <template v-if="size > 0">
            <rect x="0" y="0.15" :width="size" height="0.3" rx="0.1" ry="0.1" stroke="#fff" />
        </template>
        <template v-else>
            <rect x="-0.1" y="0.15" width="0.2" height="0.3" rx="0.1" ry="0.1" stroke="#fff" />
        </template>
    </template>
</template>
