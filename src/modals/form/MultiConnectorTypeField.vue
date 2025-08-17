<script setup lang="ts">
import type { ConnectorType } from '../../chart'
import { i18n } from '../../i18n'
import MultiToggleField from './MultiToggleField.vue'

const modelValue = defineModel<
    ConnectorType | undefined,
    string,
    boolean | undefined,
    boolean | undefined
>({
    required: true,
    get: (value) => (value === undefined ? undefined : value !== 'active'),
    set: (value): ConnectorType | undefined =>
        value === undefined ? undefined : value ? 'guide' : 'active',
})
</script>

<template>
    <MultiToggleField
        v-model="modelValue"
        :label="i18n.modals.form.connectorType.label"
        :disabled="i18n.modals.form.connectorType.active"
        :enabled="i18n.modals.form.connectorType.guide"
    />
</template>
