<script setup lang="ts">
import { i18n } from '../../../i18n'
import BaseSidebar from '../../sidebars/BaseSidebar.vue'
import DefaultSlidePropertiesFields from './DefaultSlidePropertiesFields.vue'
</script>

<template>
    <BaseSidebar :title="i18n.tools.slide.sidebar.title">
        <DefaultSlidePropertiesFields />
    </BaseSidebar>
</template>
