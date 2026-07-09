<script setup lang="ts">
import type { JudgmentLineStyle } from '../../chart/events/stage/style.ts'
import { i18n } from '../../i18n'
import OptionalToggleField from './OptionalToggleField.vue'

const modelValue = defineModel<
    JudgmentLineStyle | undefined,
    string,
    boolean | undefined,
    boolean | undefined
>({
    required: true,
    get: (value) => (value === undefined ? undefined : value !== 'default'),
    set: (value): JudgmentLineStyle | undefined =>
        value === undefined ? undefined : value ? 'singleLine' : 'default',
})
</script>

<template>
    <OptionalToggleField
        v-model="modelValue"
        :label="i18n.modals.form.judgmentLineStyle.label"
        :disabled="i18n.modals.form.judgmentLineStyle.default"
        :enabled="i18n.modals.form.judgmentLineStyle.singleLine"
    />
</template>
