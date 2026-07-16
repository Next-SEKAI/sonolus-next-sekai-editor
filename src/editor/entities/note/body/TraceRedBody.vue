<script setup lang="ts">
defineProps<{
    size: number
}>()
</script>

<template>
    <template v-if="size > 0">
        <rect x="0" y="0.15" :width="size" height="0.3" rx="0.1" ry="0.1" fill="#fe9ccb" />
    </template>
    <template v-else>
        <rect x="-0.1" y="0.15" width="0.2" height="0.3" rx="0.1" ry="0.1" fill="#fe9ccb" />
    </template>
</template>
