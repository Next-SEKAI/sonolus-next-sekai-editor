<script setup lang="ts">
import { i18n } from '../../i18n'
import BaseModal from '../../modals/BaseModal.vue'
import SettingsEditor from './SettingsEditor.vue'
import SettingsKeyboardShortcuts from './SettingsKeyboardShortcuts.vue'
import SettingsMouse from './SettingsMouse.vue'
import SettingsPlay from './SettingsPlay.vue'
import SettingsPreview from './SettingsPreview.vue'
import SettingsTouch from './SettingsTouch.vue'
import SettingsToolbar from './toolbar/SettingsToolbar.vue'
</script>

<template>
    <BaseModal :title="i18n.settings.title">
        <SettingsEditor />

        <SettingsPreview />

        <SettingsToolbar />

        <SettingsPlay />

        <SettingsTouch />

        <SettingsMouse />

        <SettingsKeyboardShortcuts />
    </BaseModal>
</template>
