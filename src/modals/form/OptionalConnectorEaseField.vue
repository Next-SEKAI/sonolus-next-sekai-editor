<script setup lang="ts">
import type { ConnectorEase } from '../../chart'
import { i18n } from '../../i18n'
import OptionalSelectField from './OptionalSelectField.vue'

const modelValue = defineModel<ConnectorEase | undefined>({ required: true })
</script>

<template>
    <OptionalSelectField
        v-model="modelValue"
        :label="i18n.modals.form.connectorEase.label"
        :options="[
            [i18n.modals.form.connectorEase.linear, 'linear'],
            [i18n.modals.form.connectorEase.in, 'in'],
            [i18n.modals.form.connectorEase.out, 'out'],
            [i18n.modals.form.connectorEase.inOut, 'inOut'],
            [i18n.modals.form.connectorEase.outIn, 'outIn'],
            [i18n.modals.form.connectorEase.none, 'none'],
        ]"
    />
</template>
