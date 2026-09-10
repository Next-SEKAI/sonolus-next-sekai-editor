<script setup lang="ts">
import type { TimeScaleTransition } from '../../chart/timeScale.ts'
import { i18n } from '../../i18n'
import OptionalToggleField from './OptionalToggleField.vue'

const modelValue = defineModel<
    TimeScaleTransition | undefined,
    string,
    boolean | undefined,
    boolean | undefined
>({
    required: true,
    get: (value) => (value === undefined ? undefined : value !== 'timeScale'),
    set: (value): TimeScaleTransition | undefined =>
        value === undefined ? undefined : value ? 'scroll' : 'timeScale',
})
</script>

<template>
    <OptionalToggleField
        v-model="modelValue"
        :label="i18n.modals.form.timeScaleTransition.label"
        :disabled="i18n.modals.form.timeScaleTransition.timeScale"
        :enabled="i18n.modals.form.timeScaleTransition.scroll"
    />
</template>
