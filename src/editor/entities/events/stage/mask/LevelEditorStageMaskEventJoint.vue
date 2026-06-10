<script setup lang="ts">
import { computed } from 'vue'
import { bpms } from '../../../../../history/bpms'
import { isDynamicStages } from '../../../../../history/dynamicStages'
import { stages } from '../../../../../history/stages'
import { settings } from '../../../../../settings'
import type { StageMaskEventJointEntity } from '../../../../../state/entities/events/joints/stage/mask'
import { beatToTime } from '../../../../../state/integrals/bpms'
import { isViewRecentlyActive, ups } from '../../../../view'

const props = defineProps<{
    entity: StageMaskEventJointEntity
    isHighlighted: boolean
}>()

const time = computed(() => beatToTime(bpms.value, props.entity.beat))

const x = computed(() => props.entity.maskLeft)
const y = computed(() => time.value * ups.value)
const w = computed(() => props.entity.maskSize)

const stage = computed(
    () =>
        settings.showStageName &&
        isDynamicStages.value &&
        (props.isHighlighted || isViewRecentlyActive.value) &&
        stages.value.get(props.entity.stageId)?.name,
)
</script>

<template>
    <g :transform="`translate(${x}, ${y})`">
        <line :x2="w" stroke="#0f0" stroke-opacity="0.5" />
        <circle r="0.1" stroke="#fff" fill="#0f0" />
        <circle :cx="w" r="0.1" stroke="#fff" fill="#0f0" />
        <text
            v-if="stage"
            :x="w / 2"
            font-size="0.4"
            text-anchor="middle"
            dominant-baseline="middle"
            fill="#a0a"
        >
            {{ stage }}
        </text>
    </g>
</template>
