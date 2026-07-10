<script setup lang="ts">
import { i18n } from '../../../../i18n'
import PropertiesModal from '../../../../modals/form/PropertiesModal.vue'
import { interpolateRaw } from '../../../../utils/interpolate'
import DefaultCameraEventPropertiesFields from '../../../tools/events/camera/DefaultCameraEventPropertiesFields.vue'
</script>

<template>
    <PropertiesModal
        :title="interpolateRaw(i18n.commands.events.modal.title, i18n.events.cameraEvent)"
    >
        <DefaultCameraEventPropertiesFields />
    </PropertiesModal>
</template>
