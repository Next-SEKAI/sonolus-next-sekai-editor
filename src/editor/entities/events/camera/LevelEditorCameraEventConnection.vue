<script setup lang="ts">
import { computed } from 'vue'
import { bpms } from '../../../../history/bpms'
import type { CameraEventConnectionEntity } from '../../../../state/entities/events/connections/camera'
import { beatToTime } from '../../../../state/integrals/bpms'
import { ups } from '../../../view'
import { getPathD } from '../path'

const props = defineProps<{
    entity: CameraEventConnectionEntity
    isHighlighted: boolean
}>()

const ds = computed(() => {
    const { min, max } = props.entity

    const tMin = beatToTime(bpms.value, props.entity.min.beat)
    const tMax = beatToTime(bpms.value, props.entity.max.beat)

    const yMin = tMin * ups.value
    const yMax = tMax * ups.value

    return [
        getPathD(min.cameraLeft, max.cameraLeft, yMin, yMax, min.eventEase),
        getPathD(
            min.cameraLeft + min.cameraSize,
            max.cameraLeft + max.cameraSize,
            yMin,
            yMax,
            min.eventEase,
        ),
    ]
})
</script>

<template>
    <g stroke="#f00" stroke-opacity="0.5">
        <path v-for="d in ds" :key="d" :d />
    </g>
</template>
