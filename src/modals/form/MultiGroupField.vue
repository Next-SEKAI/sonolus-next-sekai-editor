<script setup lang="ts">
import { state } from '../../history'
import { i18n } from '../../i18n'
import MultiSelectField from './MultiSelectField.vue'

const modelValue = defineModel<number | undefined>({ required: true })
</script>

<template>
    <MultiSelectField
        v-model="modelValue"
        :label="i18n.modals.form.group.label"
        :options="
            [...Array(state.groupCount).keys()].map((i) => [
                i ? `${i}` : i18n.modals.form.group.default,
                i,
            ])
        "
    />
</template>
