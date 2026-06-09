<script setup lang="ts">
import type { GenerateSimLines } from '../../chart/stages.ts'
import { i18n } from '../../i18n'
import ToggleField from './ToggleField.vue'

const modelValue = defineModel<GenerateSimLines, string, boolean, boolean>({
    required: true,
    get: (value) => value !== 'global',
    set: (value): GenerateSimLines => (value ? 'isolated' : 'global'),
})
</script>

<template>
    <ToggleField
        v-model="modelValue"
        :label="i18n.modals.form.generateSimLines.label"
        :disabled="i18n.modals.form.generateSimLines.global"
        :enabled="i18n.modals.form.generateSimLines.isolated"
    />
</template>
