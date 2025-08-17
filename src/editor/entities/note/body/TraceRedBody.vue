<script setup lang="ts">
defineProps<{
    size: number
}>()
</script>

<template>
    <rect x="0" y="0.2" :width="size" height="0.4" rx="0.1" ry="0.1" fill="#fe9ccb" />
</template>
