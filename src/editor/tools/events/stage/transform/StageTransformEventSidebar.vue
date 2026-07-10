<script setup lang="ts">
import { i18n } from '../../../../../i18n/index.ts'
import { interpolateRaw } from '../../../../../utils/interpolate.ts'
import BaseSidebar from '../../../../sidebars/BaseSidebar.vue'
import DefaultStageTransformEventPropertiesFields from './DefaultStageTransformEventPropertiesFields.vue'
</script>

<template>
    <BaseSidebar
        :title="interpolateRaw(i18n.tools.events.sidebar.title, i18n.events.stageTransformEvent)"
    >
        <DefaultStageTransformEventPropertiesFields />
    </BaseSidebar>
</template>
