<script setup lang="ts">
defineProps<{
    size: number
}>()
</script>

<template>
    <rect x="0" y="0" :width="size" height="0.6" rx="0.1" ry="0.1" fill="#aabfff" />
    <rect x="0.1" y="0.1" :width="size - 0.2" height="0.4" rx="0.1" ry="0.1" fill="#e6edff" />
    <rect x="0.1" y="0.225" width="0.15" height="0.15" fill="#8394f6" />
    <rect :x="size - 0.3" y="0.225" width="0.15" height="0.15" fill="#8394f6" />
</template>
