<script setup lang="ts">
import { computed } from 'vue'
import { bpms } from '../../../../../history/bpms'
import type { StageStyleEventConnectionEntity } from '../../../../../state/entities/events/connections/stage/style'
import { beatToTime } from '../../../../../state/integrals/bpms'
import { ups } from '../../../../view'
import { getPathD } from '../../path'

const props = defineProps<{
    entity: StageStyleEventConnectionEntity
    isHighlighted: boolean
}>()

const d = computed(() => {
    const { min, max } = props.entity

    const tMin = beatToTime(bpms.value, props.entity.min.beat)
    const tMax = beatToTime(bpms.value, props.entity.max.beat)

    const yMin = tMin * ups.value
    const yMax = tMax * ups.value

    return getPathD(min.editorLane, max.editorLane, yMin, yMax, min.eventEase)
})
</script>

<template>
    <g stroke="#0ff" stroke-opacity="0.5">
        <path :d />
    </g>
</template>
