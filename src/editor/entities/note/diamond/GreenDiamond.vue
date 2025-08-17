<script setup lang="ts">
defineProps<{
    size: number
}>()
</script>

<template>
    <g :transform="`translate(${size / 2}, 0.4)`">
        <polygon points="-0.3,0 0,-0.3 0.3,0 0,0.15" fill="#abfbe3" />
        <polygon points="-0.25,0 0,-0.25 0,0.1" fill="#fff" />
    </g>
</template>
