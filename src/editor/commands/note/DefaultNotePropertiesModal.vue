<script setup lang="ts">
import { i18n } from '../../../i18n'
import PropertiesModal from '../../../modals/form/PropertiesModal.vue'
import DefaultNotePropertiesFields from '../../tools/note/DefaultNotePropertiesFields.vue'
</script>

<template>
    <PropertiesModal :title="i18n.commands.note.modal.title">
        <DefaultNotePropertiesFields />
    </PropertiesModal>
</template>
