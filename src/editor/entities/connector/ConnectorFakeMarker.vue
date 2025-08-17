<script setup lang="ts">
import { computed } from 'vue'
import { bpms } from '../../../history/bpms'
import type { ConnectorEntity } from '../../../state/entities/slides/connector'
import { beatToTime } from '../../../state/integrals/bpms'
import { remap } from '../../../utils/math'
import { ups } from '../../view'

const props = defineProps<{
    entity: ConnectorEntity
}>()

const box = computed(() => {
    const { attachHead, attachTail, head, tail } = props.entity

    const tAttachHead = beatToTime(bpms.value, attachHead.beat)
    const tAttachTail = beatToTime(bpms.value, attachTail.beat)

    const tHead = beatToTime(bpms.value, head.beat)
    const tTail = beatToTime(bpms.value, tail.beat)

    const lHead = remap(tAttachHead, tAttachTail, attachHead.left, attachTail.left, tHead)
    const lTail = remap(tAttachHead, tAttachTail, attachHead.left, attachTail.left, tTail)

    const sHead = remap(tAttachHead, tAttachTail, attachHead.size, attachTail.size, tHead)
    const sTail = remap(tAttachHead, tAttachTail, attachHead.size, attachTail.size, tTail)

    return {
        xHeadL: lHead,
        xHeadR: lHead + sHead,
        yHead: tHead * ups.value,

        xTailL: lTail,
        xTailR: lTail + sTail,
        yTail: tTail * ups.value,
    }
})
</script>

<template>
    <g
        v-if="
            entity.segmentHead.connectorType === 'active' &&
            entity.segmentHead.connectorActiveIsFake
        "
        stroke="#f44"
        stroke-opacity="0.8"
    >
        <line :x1="box.xHeadL" :y1="box.yHead" :x2="box.xTailR" :y2="box.yTail" />
        <line :x1="box.xTailL" :y1="box.yTail" :x2="box.xHeadR" :y2="box.yHead" />
    </g>
</template>
