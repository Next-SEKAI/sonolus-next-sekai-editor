<script setup lang="ts">
defineProps<{
    size: number
}>()
</script>

<template>
    <rect x="0" y="0" :width="size" height="0.8" rx="0.1" ry="0.1" fill="#fec3dc" />
    <rect x="0.1" y="0.1" :width="size - 0.2" height="0.6" rx="0.1" ry="0.1" fill="#ffedf5" />
    <rect x="0.1" y="0.3" width="0.2" height="0.2" fill="#f89cc2" />
    <rect :x="size - 0.3" y="0.3" width="0.2" height="0.2" fill="#f89cc2" />
</template>
