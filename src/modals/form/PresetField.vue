<script setup lang="ts">
import { i18n } from '../../i18n'
import SelectField from './SelectField.vue'

defineProps<{
    count: number
}>()

const modelValue = defineModel<number>({ required: true })
</script>

<template>
    <SelectField
        v-model="modelValue"
        :label="i18n.modals.form.preset.label"
        :options="[...Array(count).keys()].map((i) => [`${i + 1}`, i])"
    />
</template>
