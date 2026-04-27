<script setup lang="ts">
import type { BorderStyle } from '../../chart/events/stage/style'
import { i18n } from '../../i18n'
import OptionalBorderStyleField from './OptionalBorderStyleField.vue'

const modelValue = defineModel<BorderStyle | undefined>({ required: true })
</script>

<template>
    <OptionalBorderStyleField
        v-model="modelValue"
        :label="i18n.modals.form.rightBorderStyle.label"
    />
</template>
