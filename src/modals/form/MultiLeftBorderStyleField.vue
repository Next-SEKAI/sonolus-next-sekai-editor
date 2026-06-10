<script setup lang="ts">
import type { BorderStyle } from '../../chart/events/stage/style'
import { i18n } from '../../i18n'
import MultiBorderStyleField from './MultiBorderStyleField.vue'

const modelValue = defineModel<BorderStyle | undefined>({ required: true })
</script>

<template>
    <MultiBorderStyleField v-model="modelValue" :label="i18n.modals.form.leftBorderStyle.label" />
</template>
