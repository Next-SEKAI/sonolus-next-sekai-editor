<script setup lang="ts">
import { i18n } from '../../i18n'
import ToggleField from './ToggleField.vue'

const modelValue = defineModel<boolean>({ required: true })
</script>

<template>
    <ToggleField v-model="modelValue" :label="i18n.modals.form.copyProperties.label" />
</template>
