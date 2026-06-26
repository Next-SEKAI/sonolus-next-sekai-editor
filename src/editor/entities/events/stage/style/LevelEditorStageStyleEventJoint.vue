<script setup lang="ts">
import { computed } from 'vue'
import { bpms } from '../../../../../history/bpms'
import { isDynamicStages } from '../../../../../history/dynamicStages'
import { stages } from '../../../../../history/stages'
import { settings } from '../../../../../settings'
import type { StageStyleEventJointEntity } from '../../../../../state/entities/events/joints/stage/style'
import { beatToTime } from '../../../../../state/integrals/bpms'
import { isViewRecentlyActive, ups } from '../../../../view'

const props = defineProps<{
    entity: StageStyleEventJointEntity
    isHighlighted: boolean
}>()

const time = computed(() => beatToTime(bpms.value, props.entity.beat))

const x = computed(() => props.entity.editorLane)
const y = computed(() => time.value * ups.value)

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
        <circle r="0.1" stroke="#fff" fill="#0ff" />
        <text
            v-if="stage"
            font-size="0.4"
            text-anchor="middle"
            dominant-baseline="middle"
            fill="#a0a"
        >
            {{ stage }}
        </text>
    </g>
</template>
