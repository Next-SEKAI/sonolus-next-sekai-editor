<script setup lang="ts">
import { computed } from 'vue'
import { bpms } from '../../history/bpms'
import type { TimeScaleEntity } from '../../state/entities/timeScale'
import { beatToTime } from '../../state/integrals/bpms'
import { formatTimeScale } from '../../utils/format'
import { isViewRecentlyActive, ups } from '../view'

const props = defineProps<{
    entity: TimeScaleEntity
    isHighlighted: boolean
}>()

const time = computed(() => beatToTime(bpms.value, props.entity.beat))

const y = computed(() => time.value * ups.value)
</script>

<template>
    <g>
        <line :x1="-6" :x2="6" :y1="y" :y2="y" stroke="#ff0" stroke-opacity="0.5" />

        <text :x="-6.1" :y text-anchor="end" dominant-baseline="middle" fill="#ff0">
            {{ formatTimeScale(entity.timeScale, entity.skip, entity.ease) }}
        </text>
        <text
            v-if="entity.group && (isHighlighted || isViewRecentlyActive)"
            :x="-6.1"
            :y
            font-size="0.4"
            text-anchor="start"
            dominant-baseline="middle"
            fill="#0aa"
        >
            #{{ entity.group }}
        </text>
    </g>
</template>
