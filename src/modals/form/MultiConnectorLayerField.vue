<script setup lang="ts">
import type { ConnectorLayer } from '../../chart'
import { i18n } from '../../i18n'
import MultiToggleField from './MultiToggleField.vue'

const modelValue = defineModel<
    ConnectorLayer | undefined,
    string,
    boolean | undefined,
    boolean | undefined
>({
    required: true,
    get: (value) => (value === undefined ? undefined : value !== 'top'),
    set: (value): ConnectorLayer | undefined =>
        value === undefined ? undefined : value ? 'bottom' : 'top',
})
</script>

<template>
    <MultiToggleField
        v-model="modelValue"
        :label="i18n.modals.form.connectorLayer.label"
        :disabled="i18n.modals.form.connectorLayer.top"
        :enabled="i18n.modals.form.connectorLayer.bottom"
    />
</template>
