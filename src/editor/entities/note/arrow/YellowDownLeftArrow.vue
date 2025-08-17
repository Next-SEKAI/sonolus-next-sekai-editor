<script setup lang="ts">
defineProps<{
    size: number
}>()
</script>

<template>
    <g :transform="`translate(${size / 2}, 0.4)`">
        <polygon
            points="-1,-1.2 -1.2,-0.9 -0.6,-0.1 0.6,-0.4 0.8,-0.8 -0.4,-0.5"
            fill="#ffc633"
            stroke="#fff"
        />
    </g>
</template>
