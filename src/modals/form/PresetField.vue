<script setup lang="ts">
import { i18n } from '../../i18n'
import SelectField from './SelectField.vue'

const modelValue = defineModel<number>({ required: true })
</script>

<template>
    <SelectField
        v-model="modelValue"
        :label="i18n.modals.form.preset.label"
        :options="[
            ['1', 0],
            ['2', 1],
            ['3', 2],
            ['4', 3],
        ]"
    />
</template>
