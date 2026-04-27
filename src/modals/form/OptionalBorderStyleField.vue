<script setup lang="ts">
import type { BorderStyle } from '../../chart/events/stage/style'
import { i18n } from '../../i18n'
import OptionalSelectField from './OptionalSelectField.vue'

defineProps<{
    label: string
}>()

const modelValue = defineModel<BorderStyle | undefined>({ required: true })
</script>

<template>
    <OptionalSelectField
        v-model="modelValue"
        :label
        :options="[
            [i18n.modals.form.borderStyle.default, 'default'],
            [i18n.modals.form.borderStyle.light, 'light'],
            [i18n.modals.form.borderStyle.medium, 'medium'],
            [i18n.modals.form.borderStyle.disabled, 'disabled'],
        ]"
    />
</template>
