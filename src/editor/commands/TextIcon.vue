<script setup lang="ts">
defineProps<{
    title: string
}>()
</script>

<template>
    <div class="flex items-center justify-center whitespace-nowrap text-xs">{{ title }}</div>
</template>
