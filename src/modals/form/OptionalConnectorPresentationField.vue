<script setup lang="ts">
import type { ConnectorPresentation } from '../../chart/note'
import { i18n } from '../../i18n'
import OptionalToggleField from './OptionalToggleField.vue'

const modelValue = defineModel<
    ConnectorPresentation | undefined,
    string,
    boolean | undefined,
    boolean | undefined
>({
    required: true,
    get: (value) => (value === undefined ? undefined : value !== 'default'),
    set: (value): ConnectorPresentation | undefined =>
        value === undefined ? undefined : value ? 'fullscreen' : 'default',
})
</script>

<template>
    <OptionalToggleField
        v-model="modelValue"
        :label="i18n.modals.form.connectorPresentation.label"
        :disabled="i18n.modals.form.connectorPresentation.default"
        :enabled="i18n.modals.form.connectorPresentation.fullscreen"
    />
</template>
