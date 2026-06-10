<script setup lang="ts">
import type { CameraZoomVerticalAlign } from '../../chart/events/camera.ts'
import { i18n } from '../../i18n/index.ts'
import OptionalToggleField from './OptionalToggleField.vue'

const modelValue = defineModel<
    CameraZoomVerticalAlign | undefined,
    string,
    boolean | undefined,
    boolean | undefined
>({
    required: true,
    get: (value) => (value === undefined ? undefined : value !== 'default'),
    set: (value): CameraZoomVerticalAlign | undefined =>
        value === undefined ? undefined : value ? 'center' : 'default',
})
</script>

<template>
    <OptionalToggleField
        v-model="modelValue"
        :label="i18n.modals.form.cameraZoomVerticalAlign.label"
        :disabled="i18n.modals.form.cameraZoomVerticalAlign.default"
        :enabled="i18n.modals.form.cameraZoomVerticalAlign.center"
    />
</template>
