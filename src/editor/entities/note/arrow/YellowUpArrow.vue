<script setup lang="ts">
defineProps<{
    size: number
}>()
</script>

<template>
    <g :transform="`translate(${size / 2}, 0.4)`">
        <polygon points="-1,0 -1,-0.4 0,-1 1,-0.4 1,0 0,-0.6" fill="#ffc633" stroke="#fff" />
    </g>
</template>
