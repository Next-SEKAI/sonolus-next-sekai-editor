<script setup lang="ts">
import { beats, times } from '.'
import { formatBeat, formatTime } from '../utils/format'
</script>

<template>
    <div class="absolute flex size-full flex-col justify-between text-white/50">
        <div class="flex justify-between">
            <span>{{ formatTime(times.max) }}</span>
            <span>{{ formatBeat(beats.max) }}</span>
        </div>
        <div class="flex justify-between">
            <span>{{ formatTime(times.min) }}</span>
            <span>{{ formatBeat(beats.min) }}</span>
        </div>
    </div>
</template>
