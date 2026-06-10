<script setup lang="ts">
import type { ConnectorLayer } from '../../chart/note'
import { i18n } from '../../i18n'
import OptionalSelectField from './OptionalSelectField.vue'

const modelValue = defineModel<ConnectorLayer | undefined>({ required: true })
</script>

<template>
    <OptionalSelectField
        v-model="modelValue"
        :label="i18n.modals.form.connectorLayer.label"
        :options="[
            [i18n.modals.form.connectorLayer.top, 'top'],
            [i18n.modals.form.connectorLayer.bottom, 'bottom'],
            [i18n.modals.form.connectorLayer.under, 'under'],
            [i18n.modals.form.connectorLayer.over, 'over'],
        ]"
    />
</template>
