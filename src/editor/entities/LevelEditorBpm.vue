<script setup lang="ts">
import { computed } from 'vue'
import { bpms } from '../../history/bpms'
import type { BpmEntity } from '../../state/entities/bpm'
import { beatToTime } from '../../state/integrals/bpms'
import { formatBpm } from '../../utils/format'
import { ups } from '../view'

const props = defineProps<{
    entity: BpmEntity
    isHighlighted: boolean
}>()

const time = computed(() => beatToTime(bpms.value, props.entity.beat))

const y = computed(() => time.value * ups.value)
</script>

<template>
    <g>
        <line :x1="-6" :x2="6" :y1="y" :y2="y" stroke="#f0f" stroke-opacity="0.5" />

        <text :x="6.1" :y text-anchor="start" dominant-baseline="middle" fill="#f0f">
            {{ formatBpm(entity.bpm) }}
        </text>
    </g>
</template>
