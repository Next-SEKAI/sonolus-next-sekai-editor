<script setup lang="ts">
import { watch } from 'vue'
import { bgm } from '../../history/bgm'
import { i18n } from '../../i18n'
import { localizations } from '../../i18n/localizations'
import { showModal } from '../../modals'
import NumberField from '../../modals/form/NumberField.vue'
import SelectField from '../../modals/form/SelectField.vue'
import ToggleField from '../../modals/form/ToggleField.vue'
import InfoModal from '../../modals/InfoModal.vue'
import { settings } from '../../settings'
import SettingsSection from './SettingsSection.vue'

watch(
    () => settings.waveform,
    (waveform) => {
        if (waveform === 'off') return
        if (!bgm.value.buffer) return

        void showModal(InfoModal, {
            title: () => i18n.value.settings.editor.waveformVisualization.title,
            message: () => i18n.value.settings.editor.waveformVisualization.changed,
        })
    },
)
</script>

<template>
    <SettingsSection :title="i18n.settings.editor.title">
        <SelectField
            v-model="settings.locale"
            :label="i18n.settings.editor.locale"
            :options="Object.entries(localizations).map(([locale, { title }]) => [title, locale])"
        />

        <ToggleField v-model="settings.autoSave" :label="i18n.settings.editor.autoSave" />

        <NumberField
            v-model="settings.autoSaveDelay"
            :label="i18n.settings.editor.autoSaveDelay"
            :min="0"
            :max="5"
            step="any"
        />

        <SelectField
            v-model="settings.waveform"
            :label="i18n.settings.editor.waveformVisualization.title"
            :options="[
                [i18n.settings.editor.waveformVisualization.volume, 'volume'],
                [i18n.settings.editor.waveformVisualization.fft, 'fft'],
                [i18n.settings.editor.waveformVisualization.off, 'off'],
            ]"
        />

        <ToggleField v-model="settings.dragToPanY" :label="i18n.settings.editor.dragToPanY" />

        <ToggleField v-model="settings.dragToPanX" :label="i18n.settings.editor.dragToPanX" />
    </SettingsSection>
</template>
