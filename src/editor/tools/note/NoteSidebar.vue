<script setup lang="ts">
import { i18n } from '../../../i18n'
import BaseSidebar from '../../sidebars/BaseSidebar.vue'
import DefaultNotePropertiesFields from './DefaultNotePropertiesFields.vue'
</script>

<template>
    <BaseSidebar :title="i18n.tools.note.sidebar.title">
        <DefaultNotePropertiesFields />
    </BaseSidebar>
</template>
