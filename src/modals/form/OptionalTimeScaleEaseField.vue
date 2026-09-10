<script setup lang="ts">
import type { TimeScaleEase } from '../../chart/timeScale'
import { i18n } from '../../i18n'
import OptionalSelectField from './OptionalSelectField.vue'

const modelValue = defineModel<TimeScaleEase | undefined>({ required: true })
</script>

<template>
    <OptionalSelectField
        v-model="modelValue"
        :label="i18n.modals.form.timeScaleEase.label"
        :options="[
            [i18n.modals.form.timeScaleEase.none, 'none'],
            [i18n.modals.form.timeScaleEase.linear, 'linear'],
            [i18n.modals.form.timeScaleEase.inQuad, 'inQuad'],
            [i18n.modals.form.timeScaleEase.outQuad, 'outQuad'],
            [i18n.modals.form.timeScaleEase.inOutQuad, 'inOutQuad'],
            [i18n.modals.form.timeScaleEase.outInQuad, 'outInQuad'],
        ]"
    />
</template>
