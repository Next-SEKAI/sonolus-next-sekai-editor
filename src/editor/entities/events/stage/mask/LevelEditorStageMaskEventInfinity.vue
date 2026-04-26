<script setup lang="ts">
import { computed } from 'vue'
import type { StageId } from '../../../../../chart/stages'
import { bpms } from '../../../../../history/bpms'
import { stages } from '../../../../../history/stages'
import type { StageMaskEventJointEntity } from '../../../../../state/entities/events/joints/stage/mask'
import { beatToTime } from '../../../../../state/integrals/bpms'
import type { Range } from '../../../../../utils/range'
import { ups, viewBox } from '../../../../view'

const props = defineProps<{
    id: StageId
    range: Range<StageMaskEventJointEntity>
}>()

const stage = computed(() => stages.value.get(props.id))

const xMinL = computed(() => props.range.min.maskLeft)
const xMinR = computed(() => xMinL.value + props.range.min.maskSize)

const xMaxL = computed(() => props.range.max.maskLeft)
const xMaxR = computed(() => xMaxL.value + props.range.max.maskSize)

const timeMin = computed(() => beatToTime(bpms.value, props.range.min.beat))
const timeMax = computed(() => beatToTime(bpms.value, props.range.max.beat))

const yMin = computed(() => timeMin.value * ups.value)
const yMax = computed(() => timeMax.value * ups.value)
</script>

<template>
    <g v-if="range" stroke="#0f0" stroke-opacity="0.5">
        <template v-if="stage?.isFromStart">
            <line :x1="xMinL" :x2="xMinL" :y1="0" :y2="yMin" />
            <line :x1="xMinR" :x2="xMinR" :y1="0" :y2="yMin" />
        </template>
        <template v-if="stage?.isUntilEnd">
            <line :x1="xMaxL" :x2="xMaxL" :y1="yMax" :y2="viewBox.t" />
            <line :x1="xMaxR" :x2="xMaxR" :y1="yMax" :y2="viewBox.t" />
        </template>
    </g>
</template>
