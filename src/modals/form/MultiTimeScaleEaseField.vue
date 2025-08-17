<script setup lang="ts">
import type { TimeScaleEase } from '../../chart'
import { i18n } from '../../i18n'
import MultiToggleField from './MultiToggleField.vue'

const modelValue = defineModel<
    TimeScaleEase | undefined,
    string,
    boolean | undefined,
    boolean | undefined
>({
    required: true,
    get: (value) => (value === undefined ? undefined : value !== 'none'),
    set: (value): TimeScaleEase | undefined =>
        value === undefined ? undefined : value ? 'linear' : 'none',
})
</script>

<template>
    <MultiToggleField
        v-model="modelValue"
        :label="i18n.modals.form.timeScaleEase.label"
        :disabled="i18n.modals.form.timeScaleEase.none"
        :enabled="i18n.modals.form.timeScaleEase.linear"
    />
</template>
