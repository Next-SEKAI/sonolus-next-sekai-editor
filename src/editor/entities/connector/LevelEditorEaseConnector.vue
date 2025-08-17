<script setup lang="ts">
import { computed, useId } from 'vue'
import { bpms } from '../../../history/bpms'
import type { ConnectorEntity } from '../../../state/entities/slides/connector'
import { beatToTime } from '../../../state/integrals/bpms'
import { getColor } from './color'
import ConnectorFakeMarker from './ConnectorFakeMarker.vue'
import ConnectorGradient from './ConnectorGradient.vue'
import { getPathD } from './path'

const props = defineProps<{
    entity: ConnectorEntity
}>()

const id = useId()

const graphic = computed(() => {
    const { attachHead, attachTail, head, tail, segmentHead, segmentTail } = props.entity

    const tHead = beatToTime(bpms.value, head.beat)
    const tTail = beatToTime(bpms.value, tail.beat)

    const { fill, gradient } = getColor(id, segmentHead, segmentTail, tHead, tTail)

    return {
        path: {
            d: getPathD(
                beatToTime(bpms.value, attachHead.beat),
                attachHead.left,
                attachHead.size,
                beatToTime(bpms.value, attachTail.beat),
                attachTail.left,
                attachTail.size,
                tHead,
                tTail,
                attachHead.connectorEase === 'in' ? 'in' : 'out',
            ),
            ...fill,
        },
        gradient,
    }
})
</script>

<template>
    <ConnectorGradient v-if="graphic.gradient" v-bind="graphic.gradient" />
    <path v-bind="graphic.path" />
    <ConnectorFakeMarker :entity />
</template>
