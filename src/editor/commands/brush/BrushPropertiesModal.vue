<script setup lang="ts">
import { i18n } from '../../../i18n'
import PropertiesModal from '../../../modals/form/PropertiesModal.vue'
import BrushPropertiesFields from '../../tools/brush/BrushPropertiesFields.vue'
</script>

<template>
    <PropertiesModal :title="i18n.commands.brush.modal.title">
        <BrushPropertiesFields />
    </PropertiesModal>
</template>
