<script setup lang="ts">
import type { ConnectorType } from '../../chart/note.ts'
import { i18n } from '../../i18n'
import OptionalSelectField from './OptionalSelectField.vue'

const modelValue = defineModel<ConnectorType | undefined>({ required: true })
</script>

<template>
    <OptionalSelectField
        v-model="modelValue"
        :label="i18n.modals.form.connectorType.label"
        :options="[
            [i18n.modals.form.connectorType.active, 'active'],
            [i18n.modals.form.connectorType.guide, 'guide'],
            [i18n.modals.form.connectorType.damage, 'damage'],
        ]"
    />
</template>
