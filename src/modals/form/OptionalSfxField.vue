<script setup lang="ts">
import type { NoteSfx } from '../../chart'
import { i18n } from '../../i18n'
import OptionalSelectField from './OptionalSelectField.vue'

const modelValue = defineModel<NoteSfx | undefined>({ required: true })
</script>

<template>
    <OptionalSelectField
        v-model="modelValue"
        :label="i18n.modals.form.sfx.label"
        :options="[
            [i18n.modals.form.sfx.default, 'default'],
            [i18n.modals.form.sfx.none, 'none'],
            [i18n.modals.form.sfx.normalTap, 'normalTap'],
            [i18n.modals.form.sfx.criticalTap, 'criticalTap'],
            [i18n.modals.form.sfx.normalFlick, 'normalFlick'],
            [i18n.modals.form.sfx.criticalFlick, 'criticalFlick'],
            [i18n.modals.form.sfx.normalTrace, 'normalTrace'],
            [i18n.modals.form.sfx.criticalTrace, 'criticalTrace'],
            [i18n.modals.form.sfx.normalTick, 'normalTick'],
            [i18n.modals.form.sfx.criticalTick, 'criticalTick'],
            [i18n.modals.form.sfx.damage, 'damage'],
        ]"
    />
</template>
