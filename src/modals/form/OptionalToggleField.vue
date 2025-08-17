<script setup lang="ts">
import { i18n } from '../../i18n'
import OptionalSelectField from './OptionalSelectField.vue'

defineProps<{
    label: string
    disabled?: string
    enabled?: string
}>()

const modelValue = defineModel<boolean | undefined>({ required: true })
</script>

<template>
    <OptionalSelectField
        v-model="modelValue"
        :label
        :options="[
            [disabled ?? i18n.modals.form.toggle.disabled, false],
            [enabled ?? i18n.modals.form.toggle.enabled, true],
        ]"
    />
</template>
