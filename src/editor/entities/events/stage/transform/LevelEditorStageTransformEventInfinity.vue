<script setup lang="ts">
import { computed } from 'vue'
import { bpms } from '../../../../../history/bpms'
import type { StageTransformEventJointEntity } from '../../../../../state/entities/events/joints/stage/transform'
import { beatToTime } from '../../../../../state/integrals/bpms'
import type { Range } from '../../../../../utils/range'
import { ups, viewBox } from '../../../../view'

const props = defineProps<{
    range: Range<StageTransformEventJointEntity>
}>()

const xMin = computed(() => props.range.min.xTranslation)
const xMax = computed(() => props.range.max.xTranslation)

const timeMin = computed(() => beatToTime(bpms.value, props.range.min.beat))
const timeMax = computed(() => beatToTime(bpms.value, props.range.max.beat))

const yMin = computed(() => timeMin.value * ups.value)
const yMax = computed(() => timeMax.value * ups.value)
</script>

<template>
    <g v-if="range" stroke="#ddd" stroke-opacity="0.5">
        <line :x1="xMin" :x2="xMin" :y1="0" :y2="yMin" />
        <line :x1="xMax" :x2="xMax" :y1="yMax" :y2="viewBox.t" />
    </g>
</template>
