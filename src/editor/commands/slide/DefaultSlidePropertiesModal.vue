<script setup lang="ts">
import { i18n } from '../../../i18n'
import PropertiesModal from '../../../modals/form/PropertiesModal.vue'
import DefaultSlidePropertiesFields from '../../tools/slide/DefaultSlidePropertiesFields.vue'
</script>

<template>
    <PropertiesModal :title="i18n.commands.slide.modal.title">
        <DefaultSlidePropertiesFields />
    </PropertiesModal>
</template>
