<script setup lang="ts">
import type { DefaultNoteSlideProperties } from '../../../../settings'
import { bodyComponents } from './body'
import { slideConnectorComponent } from './slideConnector'

defineProps<{
    properties: DefaultNoteSlideProperties
}>()
</script>

<template>
    <component :is="slideConnectorComponent" :properties />
    <component :is="bodyComponents.none" />
</template>
