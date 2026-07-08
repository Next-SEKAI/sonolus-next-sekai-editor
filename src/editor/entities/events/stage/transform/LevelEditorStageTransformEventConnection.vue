<script setup lang="ts">
import { computed } from 'vue'
import { bpms } from '../../../../../history/bpms'
import type { StageTransformEventConnectionEntity } from '../../../../../state/entities/events/connections/stage/transform'
import { beatToTime } from '../../../../../state/integrals/bpms'
import { ups } from '../../../../view'
import { getPathD } from '../../path'

const props = defineProps<{
    entity: StageTransformEventConnectionEntity
    isHighlighted: boolean
}>()

const d = computed(() => {
    const { min, max } = props.entity

    const tMin = beatToTime(bpms.value, props.entity.min.beat)
    const tMax = beatToTime(bpms.value, props.entity.max.beat)

    const yMin = tMin * ups.value
    const yMax = tMax * ups.value

    return getPathD(min.xTranslation, max.xTranslation, yMin, yMax, min.eventEase)
})
</script>

<template>
    <g stroke="#ddd" stroke-opacity="0.5">
        <path :d />
    </g>
</template>
