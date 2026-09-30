<script setup lang="ts">
import type { NoteColor } from '../../chart/note.ts'
import { i18n } from '../../i18n/index.ts'
import OptionalSelectField from './OptionalSelectField.vue'

const modelValue = defineModel<NoteColor | undefined>({ required: true })
</script>

<template>
    <OptionalSelectField
        v-model="modelValue"
        :label="i18n.modals.form.noteColor.label"
        :options="[
            [i18n.modals.form.noteColor.default, 'default'],
            [i18n.modals.form.noteColor.neutral, 'neutral'],
            [i18n.modals.form.noteColor.red, 'red'],
            [i18n.modals.form.noteColor.green, 'green'],
            [i18n.modals.form.noteColor.blue, 'blue'],
            [i18n.modals.form.noteColor.yellow, 'yellow'],
            [i18n.modals.form.noteColor.purple, 'purple'],
            [i18n.modals.form.noteColor.cyan, 'cyan'],
            [i18n.modals.form.noteColor.black, 'black'],
        ]"
    />
</template>
