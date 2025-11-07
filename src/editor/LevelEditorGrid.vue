<script setup lang="ts">
import { computed } from 'vue'
import { beats, times } from '.'
import { bpms } from '../history/bpms'
import { beatToTime } from '../state/integrals/bpms'
import { formatIntegerBeat, formatIntegerTime } from '../utils/format'
import { computedRange } from '../utils/range'
import { ups, view, viewBox } from './view'

const range = computedRange(() => ({
    min: Math.ceil(beats.value.min * view.division),
    max: Math.floor(beats.value.max * view.division),
}))

const lines = computed(() =>
    [...Array(range.value.max - range.value.min + 1).keys()].map((i) => ({
        y: beatToTime(bpms.value, (i + range.value.min) / view.division) * ups.value,
        isBeat: (i + range.value.min) % view.division === 0,
    })),
)

const beatNumberRange = computedRange(() => ({
    min: Math.max(1, Math.ceil(beats.value.min)),
    max: Math.floor(beats.value.max),
}))

const beatNumbers = computed(() =>
    [...Array(beatNumberRange.value.max - beatNumberRange.value.min + 1).keys()].map((i) => ({
        y: beatToTime(bpms.value, i + beatNumberRange.value.min) * ups.value,
        beat: formatIntegerBeat(i + beatNumberRange.value.min),
    })),
)

const timeNumberRange = computedRange(() => ({
    min: Math.max(1, Math.ceil(times.value.min)),
    max: Math.floor(times.value.max),
}))

const timeNumbers = computed(() =>
    [...Array(timeNumberRange.value.max - timeNumberRange.value.min + 1).keys()].map((i) => ({
        y: (i + timeNumberRange.value.min) * ups.value,
        time: formatIntegerTime(i + timeNumberRange.value.min),
    })),
)
</script>

<template>
    <g stroke="#fff">
        <g
            :transform="`translate(-7, ${Math.min(0, viewBox.b)}) scale(1, ${viewBox.t - Math.min(0, viewBox.b)})`"
        >
            <line
                v-for="i in 13"
                :key="i"
                :x1="i"
                :x2="i"
                :y1="0"
                :y2="1"
                :stroke-opacity="i === 1 || i === 13 ? 0.5 : i % 2 ? 0.25 : 0.05"
            />
        </g>

        <template v-if="range.max - range.min <= 100">
            <line
                v-for="{ y, isBeat } in lines"
                :key="y"
                :x1="-6"
                :x2="6"
                :y1="y"
                :y2="y"
                :stroke-opacity="isBeat ? 0.5 : 0.25"
            />
        </template>
    </g>

    <g fill="#fff" fill-opacity="0.5" font-size="0.4" dominant-baseline="middle">
        <text v-for="{ y, time } in timeNumbers" :key="time" x="-6.1" :y text-anchor="end">
            {{ time }}
        </text>

        <text v-for="{ y, beat } in beatNumbers" :key="beat" x="6.1" :y text-anchor="start">
            {{ beat }}
        </text>
    </g>
</template>
