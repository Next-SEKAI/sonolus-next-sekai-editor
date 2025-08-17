<script setup lang="ts">
import { computed, useId } from 'vue'
import { bpms } from '../../../history/bpms'
import type { ConnectorEntity } from '../../../state/entities/slides/connector'
import { beatToTime } from '../../../state/integrals/bpms'
import { ups } from '../../view'
import { getColor } from './color'
import ConnectorFakeMarker from './ConnectorFakeMarker.vue'
import ConnectorGradient from './ConnectorGradient.vue'

const props = defineProps<{
    entity: ConnectorEntity
}>()

const id = useId()

const graphic = computed(() => {
    const { attachHead, head, tail, segmentHead, segmentTail } = props.entity

    const tHead = beatToTime(bpms.value, head.beat)
    const tTail = beatToTime(bpms.value, tail.beat)

    const yHead = tHead * ups.value

    const yTail = tTail * ups.value

    const { fill, gradient } = getColor(id, segmentHead, segmentTail, tHead, tTail)

    return {
        rect: {
            x: attachHead.left,
            y: yTail,
            width: attachHead.size,
            height: yHead - yTail,
            ...fill,
        },
        gradient,
    }
})
</script>

<template>
    <ConnectorGradient v-if="graphic.gradient" v-bind="graphic.gradient" />
    <rect v-bind="graphic.rect" />
    <ConnectorFakeMarker :entity />
</template>
