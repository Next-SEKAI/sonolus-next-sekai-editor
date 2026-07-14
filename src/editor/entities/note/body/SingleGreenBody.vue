<script setup lang="ts">
defineProps<{
    size: number
}>()
</script>

<template>
    <rect x="0" y="0" :width="size" height="0.6" rx="0.1" ry="0.1" fill="#81f8cf" />
    <rect x="0.1" y="0.1" :width="size - 0.2" height="0.4" rx="0.1" ry="0.1" fill="#dafdf1" />
    <rect x="0.1" y="0.225" width="0.15" height="0.15" fill="#5ce29d" />
    <rect :x="size - 0.25" y="0.225" width="0.15" height="0.15" fill="#5ce29d" />
</template>
