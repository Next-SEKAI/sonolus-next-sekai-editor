<script setup lang="ts">
import { computed } from 'vue'
import { bpms } from '../../../../history/bpms'
import type { CameraEventJointEntity } from '../../../../state/entities/events/joints/camera'
import { beatToTime } from '../../../../state/integrals/bpms'
import { ups } from '../../../view'

const props = defineProps<{
    entity: CameraEventJointEntity
    isHighlighted: boolean
}>()

const time = computed(() => beatToTime(bpms.value, props.entity.beat))

const x = computed(() => props.entity.cameraLeft)
const y = computed(() => time.value * ups.value)
const w = computed(() => props.entity.cameraSize)
const l = computed(() => props.entity.cameraSize / 2 + props.entity.cameraZoomTargetLane)
</script>

<template>
    <g :transform="`translate(${x}, ${y})`">
        <line :x2="w" stroke="#f00" stroke-opacity="0.5" />
        <circle :cx="l" r="0.1" fill="#f00" fill-opacity="0.5" />
        <circle r="0.1" stroke="#fff" fill="#f00" />
        <circle :cx="w" r="0.1" stroke="#fff" fill="#f00" />
    </g>
</template>
