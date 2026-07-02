<script setup lang="ts">
import { computed } from 'vue'
import { bpms } from '../../history/bpms'
import { defaultGroupId, groups } from '../../history/groups'
import { settings } from '../../settings'
import type { TimeScaleEntity } from '../../state/entities/timeScale'
import { beatToTime } from '../../state/integrals/bpms'
import { formatTimeScale } from '../../utils/format'
import { isViewRecentlyActive, ups } from '../view'

const props = defineProps<{
    entity: TimeScaleEntity
    isHighlighted: boolean
}>()

const time = computed(() => beatToTime(bpms.value, props.entity.beat))

const x = computed(() => props.entity.editorLane)
const y = computed(() => time.value * ups.value)

const x1 = computed(() => Math.min(x.value, -6) - x.value)
const x2 = computed(() => Math.max(x.value, 6) - x.value)
</script>

<template>
    <g :transform="`translate(${x}, ${y})`">
        <line
            :x1
            :x2
            stroke="#ff0"
            stroke-opacity="0.5"
            :stroke-dasharray="entity.hideNotes ? '2 2' : ''"
            stroke-dashoffset="0"
        />
        <circle r="0.1" stroke="#fff" fill="#ff0" />

        <text
            :x="x > 0 ? 0.2 : -0.2"
            :text-anchor="x > 0 ? 'start' : 'end'"
            dominant-baseline="middle"
            fill="#ff0"
        >
            {{ formatTimeScale(entity.timeScale, entity.skip, entity.timeScaleEase) }}
        </text>
        <text
            v-if="
                settings.showGroupName &&
                entity.groupId !== defaultGroupId &&
                (isHighlighted || isViewRecentlyActive)
            "
            :x="x > 0 ? -0.2 : 0.2"
            font-size="0.4"
            :text-anchor="x > 0 ? 'end' : 'start'"
            dominant-baseline="middle"
            fill="#0aa"
        >
            {{ groups.get(entity.groupId)?.name }}
        </text>
    </g>
</template>
