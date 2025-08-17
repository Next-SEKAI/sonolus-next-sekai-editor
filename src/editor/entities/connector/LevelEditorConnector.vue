<script setup lang="ts">
import { connectorComponents } from '.'
import type { ConnectorEntity } from '../../../state/entities/slides/connector'

defineProps<{
    entity: ConnectorEntity
    isHighlighted: boolean
}>()
</script>

<template>
    <g v-if="entity.tail.beat > entity.head.beat">
        <component :is="connectorComponents[entity.attachHead.connectorEase]" :entity />
    </g>
</template>
