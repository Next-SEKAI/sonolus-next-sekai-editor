<script setup lang="ts">
import { i18n } from '../../i18n'
import ToggleField from '../../modals/form/ToggleField.vue'
import { settings } from '../../settings'
import SettingsSection from './SettingsSection.vue'
</script>

<template>
    <SettingsSection :title="i18n.settings.touch.title">
        <ToggleField
            v-model="settings.touchScrollInertia"
            :label="i18n.settings.touch.scrollInertia"
        />
    </SettingsSection>
</template>
