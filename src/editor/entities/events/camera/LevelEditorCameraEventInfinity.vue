<script setup lang="ts">
import { computed } from 'vue'
import { bpms } from '../../../../history/bpms'
import { store } from '../../../../history/store'
import { beatToTime } from '../../../../state/integrals/bpms'
import { ups, viewBox } from '../../../view'

const range = computed(() => store.value.globalEventRanges.cameraEventJoint)

const xMinL = computed(() => range.value?.min.cameraLeft ?? 0)
const xMinR = computed(() => xMinL.value + (range.value?.min.cameraSize ?? 0))

const xMaxL = computed(() => range.value?.max.cameraLeft ?? 0)
const xMaxR = computed(() => xMaxL.value + (range.value?.max.cameraSize ?? 0))

const timeMin = computed(() => beatToTime(bpms.value, range.value?.min.beat ?? 0))
const timeMax = computed(() => beatToTime(bpms.value, range.value?.max.beat ?? 0))

const yMin = computed(() => timeMin.value * ups.value)
const yMax = computed(() => timeMax.value * ups.value)
</script>

<template>
    <g v-if="range" stroke="#f00" stroke-opacity="0.5">
        <line :x1="xMinL" :x2="xMinL" :y1="0" :y2="yMin" />
        <line :x1="xMinR" :x2="xMinR" :y1="0" :y2="yMin" />
        <line :x1="xMaxL" :x2="xMaxL" :y1="yMax" :y2="viewBox.t" />
        <line :x1="xMaxR" :x2="xMaxR" :y1="yMax" :y2="viewBox.t" />
    </g>
</template>
