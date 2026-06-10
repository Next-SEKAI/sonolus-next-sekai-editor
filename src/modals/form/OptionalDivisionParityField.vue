<script setup lang="ts">
import type { DivisionParity } from '../../chart/events/stage/pivot'
import { i18n } from '../../i18n'
import OptionalToggleField from './OptionalToggleField.vue'

const modelValue = defineModel<
    DivisionParity | undefined,
    string,
    boolean | undefined,
    boolean | undefined
>({
    required: true,
    get: (value) => (value === undefined ? undefined : value !== 'even'),
    set: (value): DivisionParity | undefined =>
        value === undefined ? undefined : value ? 'odd' : 'even',
})
</script>

<template>
    <OptionalToggleField
        v-model="modelValue"
        :label="i18n.modals.form.divisionParity.label"
        :disabled="i18n.modals.form.divisionParity.even"
        :enabled="i18n.modals.form.divisionParity.odd"
    />
</template>
