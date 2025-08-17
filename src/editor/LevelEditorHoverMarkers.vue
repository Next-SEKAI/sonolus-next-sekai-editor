<script setup lang="ts">
import { computed } from 'vue'
import { bpms } from '../history/bpms'
import { settings } from '../settings'
import { timeToBeat } from '../state/integrals/bpms'
import { formatBeat, formatTime } from '../utils/format'
import { view } from './view'

const hover = computed(() => ({
    top: 0.5 * view.h - (view.hoverTime - view.time) * settings.pps,
    time: view.hoverTime,
    beat: timeToBeat(bpms.value, view.hoverTime),
}))
</script>

<template>
    <div
        class="absolute flex w-full -translate-y-1/2 justify-between text-white/50"
        :style="{ top: `${hover.top}px` }"
    >
        <span>{{ formatTime(hover.time) }}</span>
        <span>{{ formatBeat(hover.beat) }}</span>
    </div>
</template>
