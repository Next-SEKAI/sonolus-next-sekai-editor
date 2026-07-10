<script setup lang="ts">
import { i18n } from '../../../i18n'
import BaseSidebar from '../../sidebars/BaseSidebar.vue'
import BrushPropertiesFields from './BrushPropertiesFields.vue'
</script>

<template>
    <BaseSidebar :title="i18n.tools.brush.sidebar.title">
        <BrushPropertiesFields />
    </BaseSidebar>
</template>
