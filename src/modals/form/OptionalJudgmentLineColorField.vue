<script setup lang="ts">
import type { JudgmentLineColor } from '../../chart/events/stage/style'
import { i18n } from '../../i18n'
import OptionalSelectField from './OptionalSelectField.vue'

const modelValue = defineModel<JudgmentLineColor | undefined>({ required: true })
</script>

<template>
    <OptionalSelectField
        v-model="modelValue"
        :label="i18n.modals.form.judgmentLineColor.label"
        :options="[
            [i18n.modals.form.judgmentLineColor.neutral, 'neutral'],
            [i18n.modals.form.judgmentLineColor.red, 'red'],
            [i18n.modals.form.judgmentLineColor.green, 'green'],
            [i18n.modals.form.judgmentLineColor.blue, 'blue'],
            [i18n.modals.form.judgmentLineColor.yellow, 'yellow'],
            [i18n.modals.form.judgmentLineColor.purple, 'purple'],
            [i18n.modals.form.judgmentLineColor.cyan, 'cyan'],
            [i18n.modals.form.judgmentLineColor.black, 'black'],
        ]"
    />
</template>
