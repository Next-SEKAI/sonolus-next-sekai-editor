<script setup lang="ts">
import type { ConnectorColor } from '../../chart/note.ts'
import { i18n } from '../../i18n/index.ts'
import OptionalSelectField from './OptionalSelectField.vue'

const modelValue = defineModel<ConnectorColor | undefined>({ required: true })
</script>

<template>
    <OptionalSelectField
        v-model="modelValue"
        :label="i18n.modals.form.connectorColor.label"
        :options="[
            [i18n.modals.form.connectorColor.default, 'default'],
            [i18n.modals.form.connectorColor.neutral, 'neutral'],
            [i18n.modals.form.connectorColor.red, 'red'],
            [i18n.modals.form.connectorColor.green, 'green'],
            [i18n.modals.form.connectorColor.blue, 'blue'],
            [i18n.modals.form.connectorColor.yellow, 'yellow'],
            [i18n.modals.form.connectorColor.purple, 'purple'],
            [i18n.modals.form.connectorColor.cyan, 'cyan'],
            [i18n.modals.form.connectorColor.black, 'black'],
        ]"
    />
</template>
