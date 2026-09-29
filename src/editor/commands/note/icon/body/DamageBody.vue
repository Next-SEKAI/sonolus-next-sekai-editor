<script setup lang="ts">
import { damageColors } from '../../../../../utils/colors'

defineProps<{
    color: 'default' | 'neutral' | 'red' | 'green' | 'blue' | 'yellow' | 'purple' | 'cyan' | 'black'
}>()
</script>

<template>
    <rect x="-0.5" y="-0.15" width="1" height="0.3" rx="0.1" ry="0.1" :fill="damageColors[color]" />
</template>
