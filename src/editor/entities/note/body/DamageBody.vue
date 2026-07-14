<script setup lang="ts">
defineProps<{
    size: number
}>()
</script>

<template>
    <rect x="0" y="0.15" :width="size" height="0.3" rx="0.1" ry="0.1" fill="#a50acc" />
</template>
