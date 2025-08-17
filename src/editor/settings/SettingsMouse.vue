<script setup lang="ts">
import { i18n } from '../../i18n'
import SelectField from '../../modals/form/SelectField.vue'
import ToggleField from '../../modals/form/ToggleField.vue'
import { settings } from '../../settings'
import SettingsSection from './SettingsSection.vue'
</script>

<template>
    <SettingsSection :title="i18n.settings.mouse.title">
        <SelectField
            v-model="settings.mouseSecondaryTool"
            :label="i18n.settings.mouse.secondaryTool.title"
            :options="[
                [i18n.settings.mouse.secondaryTool.eraser, 'eraser'],
                [i18n.settings.mouse.secondaryTool.select, 'select'],
            ]"
        />

        <ToggleField
            v-model="settings.mouseSmoothScrolling"
            :label="i18n.settings.mouse.smoothScrolling"
        />
    </SettingsSection>
</template>
