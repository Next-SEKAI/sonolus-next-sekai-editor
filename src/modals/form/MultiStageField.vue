<script setup lang="ts">
import type { StageId } from '../../chart/stages'
import { stages } from '../../history/stages'
import { i18n } from '../../i18n'
import MultiSelectField from './MultiSelectField.vue'

const modelValue = defineModel<StageId | undefined>({ required: true })
</script>

<template>
    <MultiSelectField
        v-model="modelValue"
        :label="i18n.modals.form.stage.label"
        :options="[...stages.entries()].map(([id, { name }]) => [name, id])"
    />
</template>
