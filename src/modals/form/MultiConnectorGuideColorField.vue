<script setup lang="ts">
import type { ConnectorGuideColor } from '../../chart'
import { i18n } from '../../i18n'
import MultiSelectField from './MultiSelectField.vue'

const modelValue = defineModel<ConnectorGuideColor | undefined>({ required: true })
</script>

<template>
    <MultiSelectField
        v-model="modelValue"
        :label="i18n.modals.form.connectorGuideColor.label"
        :options="[
            [i18n.modals.form.connectorGuideColor.neutral, 'neutral'],
            [i18n.modals.form.connectorGuideColor.red, 'red'],
            [i18n.modals.form.connectorGuideColor.green, 'green'],
            [i18n.modals.form.connectorGuideColor.blue, 'blue'],
            [i18n.modals.form.connectorGuideColor.yellow, 'yellow'],
            [i18n.modals.form.connectorGuideColor.purple, 'purple'],
            [i18n.modals.form.connectorGuideColor.cyan, 'cyan'],
            [i18n.modals.form.connectorGuideColor.black, 'black'],
        ]"
    />
</template>
