<script setup lang="ts">
import { activeColors } from '../../../utils/colors'
</script>

<template>
    <svg viewBox="-0.55 -0.55 1.1 1.1">
        <rect
            x="-0.5"
            y="-0.55"
            width="1"
            height="1.1"
            :fill="activeColors.normal"
            fill-opacity="0.8"
        />
        <g transform="scale(0.6, 0.6) translate(0, 0.4)">
            <polygon points="-0.3,0 0,-0.3 0.3,0 0,0.15" fill="#abfbe3" />
            <polygon points="-0.25,0 0,-0.25 0,0.1" fill="#fff" />
        </g>
        <g transform="scale(0.6, 0.6)">
            <polygon points="-0.3,0 0,-0.3 0.3,0 0,0.15" fill="#abfbe3" />
            <polygon points="-0.25,0 0,-0.25 0,0.1" fill="#fff" />
        </g>
        <g transform="scale(0.6, 0.6) translate(0, -0.4)">
            <polygon points="-0.3,0 0,-0.3 0.3,0 0,0.15" fill="#abfbe3" />
            <polygon points="-0.25,0 0,-0.25 0,0.1" fill="#fff" />
        </g>
    </svg>
</template>
