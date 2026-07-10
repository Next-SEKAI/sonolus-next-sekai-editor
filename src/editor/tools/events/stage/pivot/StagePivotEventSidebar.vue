<script setup lang="ts">
import { i18n } from '../../../../../i18n'
import { interpolateRaw } from '../../../../../utils/interpolate'
import BaseSidebar from '../../../../sidebars/BaseSidebar.vue'
import DefaultStagePivotEventPropertiesFields from './DefaultStagePivotEventPropertiesFields.vue'
</script>

<template>
    <BaseSidebar
        :title="interpolateRaw(i18n.tools.events.sidebar.title, i18n.events.stagePivotEvent)"
    >
        <DefaultStagePivotEventPropertiesFields />
    </BaseSidebar>
</template>
