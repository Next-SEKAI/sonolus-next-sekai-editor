<script setup lang="ts">
defineProps<{
    size: number
}>()
</script>

<template>
    <line x1="0" y1="0" :x2="size" y2="0.8" stroke="#f44" />
    <line x1="0" y1="0.8" :x2="size" y2="0" stroke="#f44" />
</template>
