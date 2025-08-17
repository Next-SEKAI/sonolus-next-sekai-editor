<script setup lang="ts">
import { i18n } from '../../i18n'
import OptionalToggleField from './OptionalToggleField.vue'

const modelValue = defineModel<boolean | undefined>({ required: true })
</script>

<template>
    <OptionalToggleField
        v-model="modelValue"
        :label="i18n.modals.form.isConnectorSeparator.label"
    />
</template>
