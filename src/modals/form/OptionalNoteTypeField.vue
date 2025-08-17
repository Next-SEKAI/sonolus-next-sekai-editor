<script setup lang="ts">
import type { NoteType } from '../../chart'
import { i18n } from '../../i18n'
import OptionalSelectField from './OptionalSelectField.vue'

const modelValue = defineModel<NoteType | undefined>({ required: true })
</script>

<template>
    <OptionalSelectField
        v-model="modelValue"
        :label="i18n.modals.form.noteType.label"
        :options="[
            [i18n.modals.form.noteType.default, 'default'],
            [i18n.modals.form.noteType.trace, 'trace'],
            [i18n.modals.form.noteType.anchor, 'anchor'],
            [i18n.modals.form.noteType.damage, 'damage'],
            [i18n.modals.form.noteType.forceTick, 'forceTick'],
            [i18n.modals.form.noteType.forceNonTick, 'forceNonTick'],
        ]"
    />
</template>
