<script setup lang="ts">
import { i18n } from '../../i18n/index.ts'
import MultiToggleField from './MultiToggleField.vue'

const modelValue = defineModel<boolean | undefined>({ required: true })
</script>

<template>
    <MultiToggleField v-model="modelValue" :label="i18n.modals.form.connectorIsFake.label" />
</template>
