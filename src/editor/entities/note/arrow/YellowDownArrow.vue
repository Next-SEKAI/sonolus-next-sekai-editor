<script setup lang="ts">
defineProps<{
    size: number
}>()
</script>

<template>
    <g :transform="`translate(${size / 2}, 0.4)`">
        <polygon
            points="-1,-1.2 -1,-0.8 0,-0.2 1,-0.8 1,-1.2 0,-0.6"
            fill="#ffc633"
            stroke="#fff"
        />
    </g>
</template>
