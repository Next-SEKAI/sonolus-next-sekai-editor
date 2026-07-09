<script setup lang="ts">
import type { Anchor } from '../../chart/events/stage/transform.ts'
import { i18n } from '../../i18n'
import MultiToggleField from './MultiToggleField.vue'

const modelValue = defineModel<
    Anchor | undefined,
    string,
    boolean | undefined,
    boolean | undefined
>({
    required: true,
    get: (value) => (value === undefined ? undefined : value !== 'default'),
    set: (value): Anchor | undefined =>
        value === undefined ? undefined : value ? 'center' : 'default',
})
</script>

<template>
    <MultiToggleField
        v-model="modelValue"
        :label="i18n.modals.form.anchor.label"
        :disabled="i18n.modals.form.anchor.default"
        :enabled="i18n.modals.form.anchor.center"
    />
</template>
