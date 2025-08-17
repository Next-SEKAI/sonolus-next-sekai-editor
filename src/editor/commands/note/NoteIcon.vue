<script setup lang="ts">
defineProps<{
    index?: number
}>()
</script>

<template>
    <svg viewBox="-0.55 -0.55 1.1 1.1">
        <rect
            x="-0.5"
            y="-0.3"
            width="1"
            height="0.6"
            rx="0.1"
            ry="0.1"
            stroke="#aabfff"
            stroke-width="0.1"
            fill="#e6edff"
        />
        <rect x="-0.5" y="-0.1" width="0.2" height="0.2" fill="#8394f6" />
        <rect x="0.3" y="-0.1" width="0.2" height="0.2" fill="#8394f6" />
        <text
            v-if="index !== undefined"
            x="0"
            y="0"
            font-size="0.5"
            text-anchor="middle"
            dominant-baseline="middle"
        >
            {{ index + 1 }}
        </text>
    </svg>
</template>
