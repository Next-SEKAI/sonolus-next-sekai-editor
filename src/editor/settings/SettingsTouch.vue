<script setup lang="ts">
import { i18n } from '../../i18n'
import NumberField from '../../modals/form/NumberField.vue'
import ToggleField from '../../modals/form/ToggleField.vue'
import { settings } from '../../settings'
import SettingsSection from './SettingsSection.vue'
</script>

<template>
    <SettingsSection :title="i18n.settings.touch.title">
        <NumberField
            v-model="settings.touchQuickScrollZone"
            :label="i18n.settings.touch.quickScrollZone"
            :min="0"
            :max="50"
            step="any"
        />

        <ToggleField
            v-model="settings.touchScrollInertia"
            :label="i18n.settings.touch.scrollInertia"
        />
    </SettingsSection>
</template>
