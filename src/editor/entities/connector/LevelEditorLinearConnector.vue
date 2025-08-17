<script setup lang="ts">
import { computed, useId } from 'vue'
import { bpms } from '../../../history/bpms'
import type { ConnectorEntity } from '../../../state/entities/slides/connector'
import { beatToTime } from '../../../state/integrals/bpms'
import { remap } from '../../../utils/math'
import { ups } from '../../view'
import { getColor } from './color'
import ConnectorFakeMarker from './ConnectorFakeMarker.vue'
import ConnectorGradient from './ConnectorGradient.vue'

const props = defineProps<{
    entity: ConnectorEntity
}>()

const id = useId()

const graphic = computed(() => {
    const { attachHead, attachTail, head, tail, segmentHead, segmentTail } = props.entity

    const tAttachHead = beatToTime(bpms.value, attachHead.beat)
    const tAttachTail = beatToTime(bpms.value, attachTail.beat)

    const tHead = beatToTime(bpms.value, head.beat)
    const tTail = beatToTime(bpms.value, tail.beat)

    const lHead = remap(tAttachHead, tAttachTail, attachHead.left, attachTail.left, tHead)
    const lTail = remap(tAttachHead, tAttachTail, attachHead.left, attachTail.left, tTail)

    const sHead = remap(tAttachHead, tAttachTail, attachHead.size, attachTail.size, tHead)
    const sTail = remap(tAttachHead, tAttachTail, attachHead.size, attachTail.size, tTail)

    const xHeadL = lHead
    const xHeadR = lHead + sHead
    const yHead = tHead * ups.value

    const xTailL = lTail
    const xTailR = lTail + sTail
    const yTail = tTail * ups.value

    const { fill, gradient } = getColor(id, segmentHead, segmentTail, tHead, tTail)

    return {
        polygon: {
            points: `${xHeadL},${yHead} ${xTailL},${yTail} ${xTailR},${yTail} ${xHeadR},${yHead}`,
            ...fill,
        },
        gradient,
    }
})
</script>

<template>
    <ConnectorGradient v-if="graphic.gradient" v-bind="graphic.gradient" />
    <polygon v-bind="graphic.polygon" />
    <ConnectorFakeMarker :entity />
</template>
