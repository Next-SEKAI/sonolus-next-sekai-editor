<script setup lang="ts">
import { i18n } from '../../../../../i18n/index.ts'
import PropertiesModal from '../../../../../modals/form/PropertiesModal.vue'
import { interpolateRaw } from '../../../../../utils/interpolate.ts'
import DefaultStageTransformEventPropertiesFields from '../../../../tools/events/stage/transform/DefaultStageTransformEventPropertiesFields.vue'
</script>

<template>
    <PropertiesModal
        :title="interpolateRaw(i18n.commands.events.modal.title, i18n.events.stageTransformEvent)"
    >
        <DefaultStageTransformEventPropertiesFields />
    </PropertiesModal>
</template>
