<script setup lang="ts">
import { i18n } from '../../i18n'
import NumberField from '../../modals/form/NumberField.vue'
import SelectField from '../../modals/form/SelectField.vue'
import ToggleField from '../../modals/form/ToggleField.vue'
import { settings } from '../../settings'
import SettingsSection from './SettingsSection.vue'
</script>

<template>
    <SettingsSection :title="i18n.settings.play.title">
        <NumberField
            v-model="settings.playBgmVolume"
            :label="i18n.settings.play.bgmVolume"
            :min="0"
            :max="100"
            step="any"
        />

        <NumberField
            v-model="settings.playSfxVolume"
            :label="i18n.settings.play.sfxVolume"
            :min="0"
            :max="100"
            step="any"
        />

        <SelectField
            v-model="settings.playStartPosition"
            :label="i18n.settings.play.startPosition.title"
            :options="[
                [i18n.settings.play.startPosition.view, 'view'],
                [i18n.settings.play.startPosition.cursor, 'cursor'],
            ]"
        />

        <ToggleField v-model="settings.playFollow" :label="i18n.settings.play.follow" />

        <NumberField
            v-model="settings.playFollowPosition"
            :label="i18n.settings.play.followPosition"
            :min="0"
            :max="100"
            step="any"
        />
    </SettingsSection>
</template>
